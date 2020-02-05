'use strict';

module.exports = {
  /**
   * @api {get} /channel
   * @apiVersion 2.3.15
   * @apiName GetChannels
   * @apiGroup Channel
   *
   * @apiDescription This gets all channels visible to the current user
   * @apiSuccess {Channel[]} body an array of the call routes
   */

  find: function(req, res) {
    if (!req.user) return res.forbidden();

    var find = function() {
      if (!req.param('sort')) {
        req.query['sort'] = 'end_time Desc';
      }
      var userfind = {
        user: req.user
      };
      if (req.param('team')) userfind.team = req.param('team');
      return TeamUser.find(userfind).then(function(teamusers) {
        var ids = _.pluck(teamusers, 'id');
        return Channel.filter.find(req, {
          find: {
            user: ids
          }
        });
      });
    }

    TransformerService.channel.get(req)
      .then(find)
      .then(TransformerService.channel.send)
      .then(res.okOrNoContent)
      .catch(res.serverError)
  },

  /**
   * @api {post} /channel
   * @apiVersion 2.3.15
   * @apiName CreateChannel
   * @apiGroup Channel
   *
   * @apiDescription Create a channel
   */

  create: function(req, res) {
    if (!req.isFreeswitch) return res.forbidden();

    var transform = function() {
      return TransformerService.channel.get(req);
    }

    var findTeamUsers = function() {
      var results = {
        team: req.param('team')
      };
      if (req.param('user')) {
        return TeamUser.findOne({
            team: results.team,
            user: req.param('user')
          })
          .then(function(user) {
            if (!user) return results;
            results.user = user.id;
            return results;
          });
      }
      return results;
    };

    var create = function(results) {

      var team = results.team;
      var user = results.user;

      var newChannel = {
        team: team
      };
      if (user) newChannel.user = user;
      if (req.param('chat')) newChannel.chat = req.param('chat');
      if (req.param('name')) newChannel.name = req.param('name');
      if (req.param('number')) newChannel.number = req.param('number');
      if (req.param('UUID')) newChannel.UUID = req.param('UUID');

      // If the channel is for a callcenter, check if the callcenter already has a channel
      // This ensures a persistant channel for the callcenter/department, rather than creating a new one every time
      if (/callcenter.*/.test(newChannel.UUID)) {
        return Channel.findOne({
          UUID: newChannel.UUID
        }).then(function(ch) {
          if (ch) return ch;
          return Channel.create(newChannel);
        });
      }

      return Channel.create(newChannel);
    };

    ValidatorService.channel.validateCreate(req)
      .then(transform)
      .then(findTeamUsers)
      .then(create)
      .then(TransformerService.channel.send)
      .then(res.created)
      .catch(res.generalError)
  },

  /**
   * @api {patch} /callroute/:id
   * @apiVersion 2.3.15
   * @apiName UpdateChannel
   * @apiGroup Channel
   *
   * @apiDescription Updates a specific channel
   */

  update: function(req, res) {
    if (!req.isFreeswitch) return res.forbidden();

    var transform = function() {
      return TransformerService.channel.get(req);
    }

    var edit = function() {
      var changes = req.body;

      return Channel.updateAndPublish({
        id: req.param('id')
      }, changes);
    }

    ValidatorService.channel.validateEdit(req)
      .then(transform)
      .then(edit)
      .then(TransformerService.channel.send)
      .then(res.okOrNotFound)
      .catch(res.generalError)
  }
};