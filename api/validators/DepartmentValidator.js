'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(input) {
    var response = {};

    if (!input.name) {
      response.name = "Department name is required";
    }

    if (!input.team) {
      response.team = "Team is required";
    }

    if (!input.ring_type) {
      response.ring_type = "Ring Type is required";
    }

    return Validator.respond(response);
  },
  validateUpdate: function() {
    var response = {};

    return Validator.respond(response);
  }
};