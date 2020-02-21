'use strict';

var Transformer = require('./Transformer');
var faker = require('faker');

module.exports = {
  send: function(chat) {
    return Transformer.build(chat, {
      'id': {
        key: 'id',
        value: Chat.idToPid
      },
      'type': {
        key: 'type'
      },
      'name': {
        key: 'name'
      },
      'purpose': {
        key: 'purpose'
      },
      'users': {
        key: 'users',
        value: TransformerService.teamuser.send
      },
      'owner': {
        key: 'owner',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'messages': {
        key: 'messages',
        value: TransformerService.chatmessage.send
      },
      'meetings': {
        key: 'meetings',
        value: TransformerService.event.sendChatEvent
      },
      'links': {
        key: 'links',
        value: TransformerService.links.sendSliced
      },
      'files': {
        key: 'files',
        value: TransformerService.files.sendSliced
      },
      'createdAt': {
        key: 'created_at'
      },
      'updatedAt': {
        key: 'updated_at'
      },
      'favorite': 'favorite',
      'unread': {
        key: 'unread'
      },
      'locked': {
        key: 'locked'
      },
      'url': {
        key: 'url'
      },
      'pin': {
        key: 'pin',
        value: Chat.idToPid
      },
      'do_not_disturb': {
        key: 'do_not_disturb'
      },
      'last_message_time': {
        key: 'last_message_time'
      },
      'last_message': {
        key: 'last_message',
        value: TransformerService.chatmessage.send
      },
      'roomNumber': {
        key: 'roomNumber'
      },
      'callcenter_ring': 'callcenter_ring',
      'callcenter_voicemail_password': 'callcenter_voicemail_password',
      'callcenter_transfer_to': {
        key: 'callcenter_transfer_to',
        value: TransformerService.callroute.sendCallRouteOrPid
      },
      'callcenter_max_time': 'callcenter_max_time',
      'callcenter_hold_music': 'callcenter_hold_music',
      'routes': {
        key: 'routes',
        value: TransformerService.callroute.sendCallRouteOrPid
      },
      'color': 'color',
      'last_seen': 'last_seen',
      'avatar': {
        key: 'avatar'
      },
      'conf_pin': {
        key: 'conf_pin'
      },
      'extension': {
        key: 'extension'
      },
      'blocked': {
        key: 'blocked',
        value: TransformerService.guest.sendBlock
      },
      'filename': 'filename',
      'thumb_url': 'thumb_url'
    });
  },

  sendChatOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.chat.send(data);
    } else {
      return Chat.idToPid(data);
    }
  },

  get: function(req) {
    if (req.body) {
      if (req.body.name) {
        req.body.url = req.body.name.toLowerCase().split(' ').join('-') || req.body.url;
        req.body.pin = faker.random.number(9999) || req.body.pin;
      }
    }

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Chat.pidToId
      },
      'name': {
        key: 'name'
      },
      'purpose': {
        key: 'purpose'
      },
      'type': {
        key: 'type'
      },
      'owner': {
        key: 'owner'
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'team_slug': {
        key: 'team',
        value: function(slug) {
          return Team.findOne({
            slug: slug
          }).then(function(team) {
            if (!team) {
              return null;
            }
            return team.id;
          });
        }
      },
      'messages': {
        key: 'messages'
      },
      'meetings': {
        key: 'meetings'
      },
      'users': {
        key: 'users',
        value: function(users, rtnObj, orgObj) {
          return User.pidToId(users).then(function(ids) {
            if (!Array.isArray(ids)) {
              ids = [ids];
            }
            if (!req.isFreeswitch) {
              if (orgObj.type != 'department' && ids.indexOf('' + req.user) === -1) {
                ids.push('' + req.user);
              }
            }
            return ids;
          });
        }
      },
      'favorite': 'favorite',
      'unread': {
        key: 'unread'
      },
      'locked': {
        key: 'locked'
      },
      'url': {
        key: 'url'
      },
      'pin': {
        key: 'pin'
      },
      'roomNumber': {
        key: 'roomNumber'
      },
      'callcenter_ring': 'callcenter_ring',
      'callcenter_voicemail_password': 'callcenter_voicemail_password',
      'callcenter_transfer_to': {
        key: 'callcenter_transfer_to',
        value: CallRoute.pidToId
      },
      'routes': {
        key: 'routes',
        value: CallRoute.pidToId
      },
      'last_message_time': 'last_message_time',
      'last_message_time_from': 'last_message_time_from',
      'avatar': 'avatar',
      'last_message_time_to': 'last_message_time_to',
      'color': 'color',
      'callcenter_max_time': 'callcenter_max_time',
      'callcenter_hold_music': 'callcenter_hold_music',
      'conf_pin': 'conf_pin',
      'extension': 'extension'
    });
  },
  sendConference: function(req) {
    return Transformer.build(req, {
      'id': {
        key: 'room',
        value: Chat.idToPid
      },
      'conf_pin': {
        key: 'pin'
      },
      'slug': {
        key: 'slug'
      }
    });
  },
};