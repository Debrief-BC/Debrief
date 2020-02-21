'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: User.pidToId
      },
      'registration_id': {
        key: 'registration_id'
      },
      'device_type': {
        key: 'device_type'
      },
      'debug': {
        key: 'debug'
      },
      'do_not_disturb': {
        key: 'do_not_disturb'
      },
      'call_uuid': {
        key: 'call_uuid'
      },
      'registration_id': {
        key: 'registration_id'
      },
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'device_type': {
        key: 'device_type'
      },
      'do_not_disturb': {
        key: 'do_not_disturb'
      },
      'id': {
        key: 'id',
        value: UserDevice.idToPid
      },
      'user': {
        key: 'user',
        value: User.idToPid
      },
      'registration_id': {
        key: 'registration_id'
      },
      'debug': {
        key: 'debug'
      },
      'uuid': {
        key: 'uuid'
      },
      'createdAt': {
        key: 'created_at'
      },
      'updatedAt': {
        key: 'updated_at'
      }
    });
  },
  getNotification: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: User.pidToId
      },
      'team_slug': {
        key: 'team',
        value: function(slug) {
          return Team.findOne({
            slug: slug
          });
        }
      },
      'body': 'body',
      'type': 'type',
      'from': {
        key: 'from',
        value: function(from) {
          if (from.user) {
            from.user = User.pidToIdSync(from.user);
          }
          if (from.chat) {
            from.chat = Chat.pidToIdSync(from.chat);
          }
          return from;
        }
      },
      'call_uuid': {
        key: 'call_uuid'
      },
    });
  },
  sendNotification: function(data) {
    return Transformer.build(data, {
      teamId: {
        key: 'teamId',
        value: Team.idToPid
      },
      user: {
        key: 'user',
        value: TransformerService.user.send
      },
      chat: {
        key: 'chat',
        value: TransformerService.chat.send
      },
      body: 'body',
      timestamp: 'timestamp',
      call_uuid: 'call_uuid',
      caller_id_number: 'caller_id_number',
      caller_id_name: 'caller_id_name',
      participant_added: 'participant_added',
      participant_removed: 'participant_removed',
      user_mention: {
        key: 'user_mention',
        value: TransformerService.user.send
      }
    });
  }
};