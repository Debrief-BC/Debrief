'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(input) {
    var response = {};

    if (!input) {
      response = {
        name: 'Name is required',
        integration: 'Integration id is required'
      }
    } else {
      if (!input.name) {
        response.name = 'Name is required';
      }

      if (!input.integration) {
        response.integration = 'Integration id is required';
      }
    }

    return Validator.respond(response);
  },
  validateEdit: function(req) {
    var response = {};

    return Validator.respond(response);
  },
  validateRemove: function(input) {
    var response = {};

    return Validator.respond(response);
  }
};