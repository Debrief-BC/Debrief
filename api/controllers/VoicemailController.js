'use strict';

var options = {
  timezone: 'UTC'
};
var moment = require('moment');
module.exports = {
  /**
   * @api {get} /voicemail
   * @apiVersion 2.3.15
   * @apiName GetVoicemails
   * @apiGroup Voicemail
   * @apiDescription returns a list of voicemails for a user
   */
  find: function(req, res) {
    ValidatorService.voicemail.validateFind(req)
      .then(function() {
        return TransformerService.voicemail.unifyRequest(req);
      })
      .then(function() {
        if (req.param('personal_owner')) {
          return User.findOne({
            id: req.param('personal_owner')
          }).then(function(user) {
            options.timezone = user.timezone ? user.timezone : options.timezone;
          });
        }
      })
      .then(function() {
        var queryCriteria = {
          team: req.param('team'),
          createdAt: {
            '>=': moment().subtract(15, 'days').utc().startOf('day').format('YYYY-MM-DD HH:mm:ss')
          }
        };
        if (req.param('personal_owner')) {
          queryCriteria.personal_owner = req.param('personal_owner');
        }
        if (req.param('group_owner')) {
          queryCriteria.group_owner = req.param('group_owner');
        }
        queryCriteria.or = [{
          'read_flags': null
        }, {
          'read_flags': 'saved'
        }];
        return Voicemail.find(queryCriteria);
      })
      .then(function(vms) {
        return TransformerService.voicemail.unifyResponse(vms, options);
      })
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {post} /voicemail
   * @apiVersion 2.3.15
   * @apiName GetVoicemail
   * @apiGroup Voicemail
   * @apiDescription returns a specific voicemail
   * @apiParam {integer} id the voicemail id
   */
  create: function(req, res) {
    var transform = function() {
      return TransformerService.voicemail.unifyRequest(req);
    };

    ValidatorService.voicemail.validateCreate(req)
      .then(transform)
      .then(function() {
        console.log(req.body);
        var options = {
          user: req.body.personal_owner ? req.body.personal_ower : null,
          team: req.body.team,
        };
        return Files.upload(req, options);
      }).then(function(files) {
        console.log(files);
        return {
          team: req.body.team,
          file: files[0].id,
          chat: req.body.chat,
          cid_team: req.body.cid_team ? req.body.cid_team : null,
          cid_pstn: req.body.cid_pstn ? req.body.cid_pstn : null,
          personal_owner: req.body.personal_owner ? req.body.personal_owner : null,
          group_owner: req.body.group_owner ? req.body.group_owner : null
        };
      })
      .then(function(options) {
        return Voicemail.createAndPublish(options, req);
      })
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {post} /voicemail/:id/user/:uid
   * @apiVersion 2.3.15
   * @apiName Forward voicemail
   * @apiGroup Voicemail
   * @apiDescription returns the forwarded voicemail
   * @apiParam {integer} id the voicemail id
   */
  forward: function(req, res) {
    Voicemail.pidToId(req.param('id'))
      .then(function(id) {
        return Voicemail.findOne({
          id: id
        })
      })
      .then(function(vm) {
        return CallRoute.findOne({
            team: vm.team,
            extension: req.param('uid')
          })
          .then(function(callroute) {
            return TeamUser.findOne({
              id: callroute.owner
            });
          })
          .then(function(teamuser) {
            return {
              team: vm.team,
              file: vm.file,
              chat: vm.chat,
              cid_team: vm.cid_team,
              cid_pstn: vm.cid_pstn,
              personal_owner: teamuser.user,
              group_owner: null
            };
          });
      })
      .then(function(option) {
        return Voicemail.createAndPublish(option);
      })
      .then(function(vm) {
        return TransformerService.voicemail.unifyResponse(vm, options);
      })
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /voicemail/:id
   * @apiVersion 2.3.15
   * @apiName EditVoicemail
   * @apiGroup Voicemail
   * @apiDescription Edits a voicemail (mark as read, etc.)
   * @apiParam {integer} id the voicemail id
   */
  update: function(req, res) {
    var transform = function() {
      return TransformerService.voicemail.unifyRequest(req);
    };
    // ValidatorService.voicemail.validateUpdate(req)
    // .then(transform)
    transform()
      .then(function() {
        return Voicemail.update({
          id: req.param('id')
        }, req.body, req);
      })
      .then(function(vms) {
        return TransformerService.voicemail.unifyResponse(vms, options);
      })
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /voicemail/:id
   * @apiVersion 2.3.15
   * @apiName DeleteVoicemail
   * @apiGroup Voicemail
   * @apiDescription Deletes a voicemail
   * @apiParam {integer} id the voicemail id
   */
  destroy: function(req, res) {
    return res.ok('not implemented yet');
  },

  /**
   * @api {patch} /voicemail/:id
   * @apiVersion 2.3.15
   * @apiName EditVoicemail
   * @apiGroup Voicemail
   * @apiDescription Edits a voicemail (mark as read, etc.)
   * @apiParam {integer} id the voicemail id
   */

  getSettings: function(req, res) {
    ValidatorService.voicemailPrefs.validateFind(req)
      .then(function() {
        return TransformerService.voicemailPrefs.unifyRequest(req);
      })
      .then(function() {
        var user = req.param('user');
        var team = req.param('team');
        return VoicemailPrefs.findOne({
          user: user,
          team: team
        });
      })
      .then(function(settings) {
        return TransformerService.voicemailPrefs.unifyResponse(settings);
      })
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {patch} /voicemail/:id
   * @apiVersion 2.3.15
   * @apiName EditVoicemail
   * @apiGroup Voicemail
   * @apiDescription Edits a voicemail (mark as read, etc.)
   * @apiParam {integer} id the voicemail id
   */
  setGreeting: function(req, res) {
    ValidatorService.voicemailPrefs.validateChangeGreeting(req)
      .then(function() {
        return TransformerService.voicemailPrefs.unifyRequest(req);
      }).then(function() {
        return Files.upload(req, {
          user: req.body.user,
          team: req.body.team,
        });
      })
      .then(function(files) {
        return VoicemailPrefs.findOne({
            user: req.body.user,
            team: req.body.team
          })
          .then(function(pref) {
            if (pref && pref.id) {
              return VoicemailPrefs.updateAndPublish({
                id: pref.id
              }, {
                greeting: files[0].id
              });
            } else {
              return VoicemailPrefs.createAndPublish({
                user: req.body.user,
                team: req.body.team,
                greeting: files[0].id
              });
            }
          });
      })
      .then(TransformerService.voicemailPrefs.unifyResponse)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },
  /**
   * @api {patch} /voicemail/:id
   * @apiVersion 2.3.15
   * @apiName EditVoicemail
   * @apiGroup Voicemail
   * @apiDescription Edits a voicemail (mark as read, etc.)
   * @apiParam {integer} id the voicemail id
   */
  setPassword: function(req, res) {
    ValidatorService.voicemailPrefs.validateChangePassword(req)
      .then(function() {
        return TransformerService.voicemailPrefs.unifyRequest(req);
      })
      .then(function() {
        return VoicemailPrefs.findOne({
          user: req.body.user,
          team: req.body.team
        });
      })
      .then(function(setting) {
        if (setting && setting.id) {
          return VoicemailPrefs.updateAndPublish({
            id: setting.id
          }, {
            password: req.body.password
          });
        } else {
          return VoicemailPrefs.createAndPublish({
            user: req.body.user,
            team: req.body.team,
            password: req.body.password
          });
        }
      })
      .then(function(setting) {
        return TransformerService.voicemailPrefs.unifyResponse(setting);
      })
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },
};