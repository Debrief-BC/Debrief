'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    if (!req.param('user') && !req.param('name') && !req.param('number') && !req.param('chat')) {
      response.source = "You must provide at least one of: a user id, acaller id name & number or a chat id";
    }

    if (!req.param('slug') && !req.param('team')) {
      response.team = "Either a team or a slug is required";
    }

    return Validator.respond(response);
  },
  validateEdit: function(req) {
    var response = {};

    if (req.param('user') || req.param('name') || req.param('number') || req.param('chat')) {
      response.source = "You cannot edit the source associated with a channel (user, caller id name & number or chat)"
    }

    return Validator.respond(response);
  }
};