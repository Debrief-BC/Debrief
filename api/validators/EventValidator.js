'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(input) {
    var response = {};

    if (!input) {
      response = {
        name: 'Name is required',
        start: 'Start time is required',
        type: 'Type is required'
      }
    } else {
      if (!input.name) {
        response.name = 'Name is required';
      }

      if (!input.start) {
        response.start = 'Start is required';
      }

      if (!input.end) {
        response.end = 'End is required';
      }
    }

    return Validator.respond(response);
  },
  validateUpdate: function(req) {
    var response = {};

    if (req.start && !req.end) {
      response.end = "If Start is present, End is required";
    } else if (req.end && !req.start) {
      response.end = "If End is present, Start is required";
    }

    return Validator.respond(response);
  },
  validateRemove: function(input) {
    var response = {};

    return Validator.respond(response);
  }
};