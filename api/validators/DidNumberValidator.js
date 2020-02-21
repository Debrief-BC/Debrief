'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(input) {
    var response = {};
    return Validator.respond(response);
  },
  validateEdit: function(input) {
    var response = {};
    return Validator.respond(response);
  },
  validateState: function(req) {
    var response = {};

    if (!req.param('country')) {
      response.country = "Country is required";
    }

    return Validator.respond(response);
  },
  validateAutoreceptionCreate: function(req) {
    var response = {};

    if (!req.param('didGroupId')) {
      response.didGroupId = "Group ID is required";
    }
    if (!req.param('id')) {
      response.id = "Team Id is required parameter";
    }

    return Validator.respond(response);
  },
};