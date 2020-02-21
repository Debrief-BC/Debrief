'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(calllog) {
    return Transformer.build(calllog, {
      'id': {
        key: 'id',
        value: ChannelEvent.idToPid
      },
      'channel': {
        key: 'channel',
        value: TransformerService.channel.sendChannelOrPid
      },
      'data': 'data',
      'attached_route': {
        key: 'attached_route',
        value: TransformerService.callroute.sendCallRouteOrPid
      },
      'attached_channel': {
        key: 'attached_channel',
        value: TransformerService.channel.sendChannelOrPid
      },
      'attached_event': {
        key: 'attached_event',
        value: TransformerService.channelevent.sendChannelEventOrPid
      },
      'createdAt': {
        key: 'created_at'
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'type': 'type'
    });
  },

  sendChannelEventOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.channelevent.send(data);
    } else {
      return ChannelEvent.idToPid(data);
    }
  },

  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: ChannelEvent.pidToId
      },
      'channel': {
        key: 'channel',
        value: Channel.pidToId
      },
      'data': 'data',
      'attached_route': {
        key: 'attached_route',
        value: CallRoute.pidToId
      },
      'attached_channel': {
        key: 'attached_channel',
        value: Channel.pidToId
      },
      'attached_event': {
        key: 'attached_event',
        value: ChannelEvent.pidToId
      },
      'created_at': {
        key: 'createdAt'
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'slug': {
        key: 'team',
        value: function(slug) {
          return Team.findOne({
            slug: slug
          }).then(function(team) {
            return team.id || null;
          });
        }
      },
      'type': 'type',
      'attached_channel_uuid': {
        key: 'attached_channel',
        value: function(uuid) {
          return Channel.findOne({
            UUID: uuid,
            sort: 'id DESC'
          }).then(function(channel) {
            if (!channel) return null;
            return channel.id;
          });
        }
      },
      'channel_uuid': {
        key: 'channel',
        value: function(uuid) {
          return Channel.findOne({
            UUID: uuid,
            sort: 'id DESC'
          }).then(function(channel) {
            if (!channel) return null;
            return channel.id;
          });
        }
      }
    });
  }
};