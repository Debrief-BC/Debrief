'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Country.pidToId
      },
      'code': {
        key: 'code'
      }
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Country.idToPid
      },
      'code': {
        key: 'code'
      },
      'name': {
        key: 'name'
      }
    });
  }
};