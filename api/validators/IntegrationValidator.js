'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    if (req && !req.body) {
      response = {
        type: 'type is required',
        provider: 'provider is required',
        client: 'client is required'
      };
    } else {
      if (!req.param('type')) {
        response.type = 'type is required';
      }

      if (!req.param('provider')) {
        response.provider = 'provider is required';
      }

      if (!req.param('client')) {
        response.client = 'client is required';
      }
    }

    return Validator.respond(response);
  },
  validateUpdate: function(req) {
    var response = {};
    return Validator.respond(response);
  }
};