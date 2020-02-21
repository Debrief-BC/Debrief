'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      "id": {
        key: 'id',
        value: Language.pidToId
      },
      "body": {
        key: 'body'
      },
      "created_at": {
        key: 'createdAt'
      },
      "updated_at": {
        key: 'updatedAt'
      },
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      "id": {
        key: 'id',
        value: Language.idToPid
      },
      "body": {
        key: 'body'
      },
      "createdAt": {
        key: 'created_at'
      },
      "updatedAt": {
        key: 'updated_at'
      },
    });
  },
  sendLangOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.language.send(data);
    } else {
      return Language.idToPid(data);
    }
  },
}