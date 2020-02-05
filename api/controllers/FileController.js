'use strict';

var SkipperDisk = require('skipper-disk');
var fs = require('fs');

module.exports = {
  /**
   * @api {get} /file
   * @apiVersion 2.3.15
   * @apiName GetFiles
   * @apiGroup File
   * @apiDescription returns a list of files current user sent
   */

  find: function(req, res) {

    var setOptions = function() {
      return TeamUser.findOne({
          team: req.param('team'),
          user: req.user
        })
        .then(function(user) {
          if (req.isSuperAdmin) {
            return {
              find: {
                team: req.param('team')
              }
            };
          };

          if (!req.param('routing_audio')) {
            return {
              find: {
                teamuser: user.id,
                team: req.param('team')
              }
            };
          }

          return {
            find: {
              routing_audio: true,
              team: req.param('team')
            }
          };
        })
    }

    var findFiles = function(options) {
      return Files.filter.find(req, options);
    }


    TransformerService.files.get(req)
      .then(setOptions)
      .then(findFiles)
      .then(TransformerService.files.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);

  },

  /**
   * @api {get} /file/:id
   * @apiVersion 2.3.15
   * @apiName GetFiles
   * @apiGroup File
   * @apiDescription returns the details of an individual file
   * @apiParam {string} id
   */

  findOne: function(req, res) {

    var transformRequest = TransformerService.files.get(req);

    var filterFilesByUser = function() {

      var options = {
        find: {
          user: req.user,
          id: req.param('id')
        }
      };

      return Files.filter.find(req, options).then(function(items) {
        if (!items) return res.notFound();
        return items;
      });
    };

    transformRequest
      .then(filterFilesByUser)
      .then(TransformerService.files.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);


  },

  download: function(req, res) {
    console.log('downloading', req.param('url'));

    function findFileDetails() {
      var url = req.param('url');
      var splitUrl = url.split('.');
      var name = splitUrl[0];
      return Files.findOne({
        name: name
      });
    }

    function streamFile(file) {
      if (!file) return res.notFound();
      var filePath = sails.config.uploadDir + "/" + file.name + '.' + file.extension;
      var filename = file.filename;

      var fileAdapter = SkipperDisk();
      fileAdapter.read(filePath)
        .on('error', function(err) {
          res.serverError(err)
        })
        .pipe(res.attachment(filename));
    }

    findFileDetails()
      .then(streamFile);
  },

  /**
   * @api {post} /file
   * @apiVersion 2.3.15
   * @apiName AddFile
   * @apiGroup File
   * @apiDescription uploads a file and adds its details to the db
   */

  create: function(req, res) {
    var transformRequest = function() {
      return TransformerService.files.get(req);
    };

    var UploadFile = function() {
      var opts = {
        team: req.param('team')
      };
      if (req.param('routing_audio')) {
        opts.routing_audio = true;
      }
      if (req.param('user')) {
        opts.user = req.param('user')
      }

      return Files.upload(req, opts);
    };


    ValidatorService.files.validateCreate(req)
      .then(transformRequest)
      .then(UploadFile)
      .then(TransformerService.files.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /file/:id
   * @apiVersion 2.3.15
   * @apiName EditFile
   * @apiGroup File
   * @apiDescription Edits a file
   * @apiParam {string} id
   */

  update: function(req, res) {
    return res.ok('not implemented yet');
  },

  /**
   * @api {delete} /file/:id
   * @apiVersion 2.3.15
   * @apiName DeleteFile
   * @apiGroup File
   * @apiDescription Deletes a file
   * @apiParam {string} id
   */
  destroy: function(req, res) {
    return res.ok('not implemented');
  },

  findLinksAndFiles: function(req, res) {

    var transformRequest = TransformerService.files.getLinksAndFiles(req);

    var getLinksAndFiles = function() {

      return Files.getLinksAndFiles(req).then(function(response) {
        return response;
      })

    }

    transformRequest
      .then(getLinksAndFiles)
      .then(TransformerService.files.sendLinksAndFiles)
      .then(res.okOrNotFound)
      .catch(res.generalError);

  },

  /**
   * @api {delete} /file/:id
   * @apiVersion 2.3.15
   * @apiName DeleteFile
   * @apiGroup File
   * @apiDescription Deletes a file
   * @apiParam {string} id
   */

  resendFile: function(req, res) {

    var transformRequest = TransformerService.files.get(req);
    var fromUser = null;
    var chat = null;

    var ensureChatExists = function() {
      return Chat.findOne({
          id: req.param('chat')
        })
        .then(function(c) {
          if (!c) throw 'chat doesn\'t exist';
          chat = c;
        });
    };

    var setFrom = function() {
      return TeamUser.findOne({
        team: chat.team,
        user: req.user
      }).then(function(teamuser) {
        fromUser = teamuser && teamuser.id || null;
      });
    };

    var markLastSeen = function() {
      var chatid = req.param('chatid');
      var user = fromUser;
      var body = {
        last_seen: new Date().toISOString()
      };

      return ChatUser.updateAndPublish({
        user: user,
        chat: chatid
      }, body, req);
    };

    var addMessage = function(file) {

      var chatMessage = {
        from: fromUser,
        type: "file",
        chat: chat.id,
        file: req.param('id')
      }

      return ChatMessage.createAndPublish(chatMessage, req);
    };

    transformRequest
      .then(ensureChatExists)
      .then(setFrom)
      .then(markLastSeen)
      .then(addMessage)
      .then(TransformerService.chatmessage.send)
      .then(res.created)
      .catch(res.generalError);

  }


}