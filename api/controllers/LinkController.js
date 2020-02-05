'use strict';

module.exports = {
  /**
   * @api {get} /link
   * @apiVersion 2.3.15
   * @apiName GetLinks
   * @apiGroup Links
   * @apiDescription returns the list of the links current user sent
   */

  find: function(req, res) {
    //return res.ok('not implemented yet!');

    /*
    var transformRequest = TransformerService.links.get(req);

    var filterLinksByUser = function() {

        var options = {
            find: { user: req.user }
        };

        if (!req.param('sort')) {
            req.query['sort'] = 'createdAt Desc';
        }

        //return Links.find(options.find).populate(["chat", "user"]);
        return Links.filter.find(req, options);

    };

    transformRequest
        .then(filterLinksByUser)
        .then(TransformerService.links.send)
        .then(res.okOrNotFound)
        .catch(res.generalError);
    */

    var findLinksByCurrentUser = function() {
      var users = req.param('users') || [req.user];
      return ChatUser.findChatsByUsers(users, req.user).then(function(chats) {
        return chats;
      })
    };

    var findLinks = function(chats) {

      var chats = _.pluck(chats, 'chat');
      var options = {
        find: {
          chat: chats
        }
      };

      return Links.filter.find(req, options).then(function(links) {
        return links;
      });
    }


    TransformerService.chat.get(req)
      .then(findLinksByCurrentUser)
      .then(findLinks)
      .then(TransformerService.links.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);

  }

}