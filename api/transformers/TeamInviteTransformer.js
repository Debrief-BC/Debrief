'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {
    return Transformer.build(data, {
      'token': {
        key: 'token',
        value: TeamInvite.idToPid
      },
      'user': {
        key: 'email'
      },
      'userId': {
        key: 'user_id',
        value: TeamUser.idToPid
      },
    });
  },
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'token': {
        key: 'token',
        value: TeamInvite.pidToId
      },
      'firstname': {
        key: 'firstname'
      },
      'lastname': {
        key: 'lastname'
      },
      'password': {
        key: 'password'
      }
    });
  }
}