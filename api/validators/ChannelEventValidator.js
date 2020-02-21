'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    Validator.require('type', req, response);

    if (!req.param('channel') && !req.param('channel_uuid')) {
      response.team = "Either a channel or a channel_uuid is required";
    }

    return Validator.respond(response);
  },
  validateEdit: function() {
    var response = {};
    return Validator.respond(response);
  }
};