'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Currency.pidToId
      },
      'name': {
        key: 'name'
      },
      'country': {
        key: 'country'
      },
      'rate': {
        key: 'rate'
      },
      'symbol': {
        key: 'symbol'
      },
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Currency.idToPid
      },
      'name': {
        key: 'name'
      },
      'country': {
        key: 'country'
      },
      'rate': {
        key: 'rate'
      },
      'symbol': {
        key: 'symbol'
      },
    });
  }
};