'use strict';

module.exports = {
  /**
   * @api {get} /channel_event
   * @apiVersion 2.3.15
   * @apiName GetChannelEvents
   * @apiGroup ChannelEvents
   *
   * @apiDescription This gets all channel events visible to the current user
   * @apiSuccess {ChannelEvents[]} body an array of the channel events
   */

  /**
   * @api {get} /channel_event/:channel/events
   * @apiVersion 2.3.15
   * @apiName GetChannelEvents
   * @apiGroup ChannelEvents
   *
   * @apiDescription This gets all channel events visible to the current user
   * @apiSuccess {ChannelEvents[]} body an array of the channel events
   */

  find: function(req, res) {
    if (!req.user) return res.forbidden();

    var find = function() {
      if (!req.param('sort')) {
        req.query['sort'] = 'createdAt Desc';
      }
      return ChannelEvent.filter.find(req);
    }

    TransformerService.channelevent.get(req)
      .then(find)
      .then(TransformerService.channelevent.send)
      .then(res.okOrNoContent)
      .catch(res.serverError)
  },

  /**
   * @api {post} /channel_event
   * @apiVersion 2.3.15
   * @apiName GetChannelEvents
   * @apiGroup ChannelEvents
   *
   * @apiDescription This gets all channel events visible to the current user
   * @apiSuccess {ChannelEvents[]} body an array of the channel events
   */
  create: function(req, res) {
    if (!req.isFreeswitch) return res.forbidden();

    var transform = function() {
      return TransformerService.channelevent.get(req);
    }

    var ensureTeam = function() {
      if (!req.body.team) {
        return Channel.findOne({
          id: req.param('channel')
        }).then(function(channel) {

          if (channel) {
            req.body.team = channel.team;
          }

          return req.body;
        });
      }

      return req.body;
    }

    var create = function(body) {
      return ChannelEvent.create(body);
    };

    var createMatching = function(event) {
      if (req.param('attached_channel')) {
        var matching_event = {
          attached_channel: event.channel,
          attached_event: event.id,
          type: event.type,
          data: event.data,
          attached_route: event.attached_route,
          team: event.team,
          channel: event.attached_channel
        };
        switch (req.param('type')) {
          case 'start_call_to':
            matching_event.type = 'incoming_call';
            break;
          case 'voicemail_left':
            matching_event.type = 'voicemail_recieved';
            break;
        }

        var patch_event = function(match) {
          return ChannelEvent.update({
              id: event.id
            }, {
              attached_event: match.id
            })
            .then(function(updated) {
              return [updated, match];
            });
        }

        return ChannelEvent.create(matching_event)
          .then(patch_event);
      }
      return event;
    }

    ValidatorService.channelevent.validateCreate(req)
      .then(transform)
      .then(ensureTeam)
      .then(create)
      .then(createMatching)
      .then(TransformerService.channelevent.send)
      .then(res.created)
      .catch(res.generalError)
  }
};