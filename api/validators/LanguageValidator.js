'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var input = req.body;
    var response = {};

    if (!input || !input.locale) {
      response.locale = "locale is required";
    }
    if (!input || !input.body) {
      response.body = "body is required";
    }
    if (!req.isSuperAdmin) {
      response.authorizationError = "Only an admin can create a language";
    }

    return Validator.respond(response);

  },
  validateUpdate: function(req) {
    var response = {};

    if (!req.isSuperAdmin) {
      response.authorizationError = "Only an admin can edit a language";
    }

    return Validator.respond(response);
  }
};