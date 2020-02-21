'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    Validator.require("type", req, response);
    Validator.require("from", req, response);
    Validator.require("to", req, response);
    Validator.require("duration", req, response);

    if (!req.param('slug') && !req.param('team')) {
      response.team = "Either a team or a slug is required";
    }

    return Validator.respond(response);
  },
  validateEdit: function() {
    var response = {};
    return Validator.respond(response);
  }
};