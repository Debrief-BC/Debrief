'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    if (req && !req.body) {
      response = {
        email: 'email is required'
      };
    } else {
      if (!req.param('email')) {
        response.email = 'email is required';
      }
    }

    return Validator.respond(response);
  }
};