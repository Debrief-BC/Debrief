'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(calllog) {
    return Transformer.build(calllog, {
      'id': {
        key: 'id',
        value: Channel.idToPid
      },
      'user': {
        key: 'user',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'name': 'name',
      'number': 'number',
      'chat': {
        key: 'chat',
        value: TransformerService.chat.sendChatOrPid
      },
      'start_time': 'start_time',
      'end_time': 'end_time',
      'UUID': 'UUID',
      'events': {
        key: 'events',
        value: TransformerService.channelevent.sendChannelEventOrPid
      },
      'attached_events': {
        key: 'attached_events',
        value: TransformerService.channelevent.sendChannelEventOrPid
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      }
    });
  },

  sendChannelOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.channel.send(data);
    } else {
      return Channel.idToPid(data);
    }
  },

  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Channel.pidToId
      },
      'user': {
        key: 'user',
        value: TeamUser.pidToId
      },
      'name': 'name',
      'number': 'number',
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'start_time': 'start_time',
      'end_time': 'end_time',
      'UUID': 'UUID',
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
      }
    });
  }
};