'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {
    return Transformer.build(data, {
      'id': 'id',
      'users': {
        key: 'users',
        value: function(users) {
          return Transformer.build(users, {
            'conference_user_id': 'conference_user_id',
            'conference_status': 'conference_status',
            'caller_id_name': 'caller_id_name',
            'caller_id_number': 'caller_id_number',
            'user': {
              key: 'user',
              value: TransformerService.user.sendUserOrPid
            }
          });
        }
      }
    });
  },
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': 'id',
      'media_server': 'media_server'
    });
  }
};