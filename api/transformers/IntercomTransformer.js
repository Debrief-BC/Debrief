'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'email': {
        key: 'email'
      }
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'hash': {
        key: 'hash'
      }
    });
  }
};