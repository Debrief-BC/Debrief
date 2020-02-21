'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      "id": {
        key: 'id',
        value: function(value) {
          if (value) {
            // match the id to check if a locale was entered (ex. enUS, en-US)
            return value.match(/^(\D{2}(-|_|)\D{2})$/) ? value.replace(/-/g, '').replace(/_/g, '') : Locale.pidToId(value);
          }
        }
      },
      "locale": {
        key: 'locale'
      },
      "label": {
        key: 'label'
      },
      "value": {
        key: 'value'
      },
      "language": {
        key: 'language',
        value: Language.pidToId
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
        value: Locale.idToPid
      },
      "locale": {
        key: 'locale'
      },
      "label": {
        key: 'label'
      },
      "value": {
        key: 'value'
      },
      "language": {
        key: 'language',
        value: TransformerService.language.sendLangOrPid
      },
      "createdAt": {
        key: 'created_at'
      },
      "updatedAt": {
        key: 'updated_at'
      },
    });
  },
}