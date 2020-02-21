'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Department.idToPid
      },
      'name': {
        key: 'name'
      },
      'extension': {
        key: 'extension'
      },
      'company': {
        key: 'company'
      },
      'ringType': {
        key: 'ring_type'
      },
      'owner': {
        key: 'owner',
        value: TransformerService.user.sendUserOrPid
      },
      'users': {
        key: 'users',
        value: TransformerService.user.send
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      }
    });
  },
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Department.pidToId
      },
      'name': {
        key: 'name'
      },
      'extension': {
        key: 'extension'
      },
      'ring_type': {
        key: 'ringType'
      },
      'owner': {
        key: 'owner',
        value: User.pidToId
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      }
    });
  }
};