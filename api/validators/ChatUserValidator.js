'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};
    if (!req.param('user')) {
      response.user = "user is a required field";
    }
    return Validator.respond(response);
  },
  validateEdit: function(req) {
    var response = {};
    if (req.param('user')) {
      response.user = "you cannot change the user";
    }
    if (req.param('chat')) {
      response.user = "you cannot change the chat";
    }

    return Validator.respond(response);
  },
  validateRemove: function(req) {
    var response = {};

    return Validator.respond(response);

  }
};