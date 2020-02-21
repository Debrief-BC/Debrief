'use strict';

var Validation = require('validator');
var Validator = require('./Validator');
var libphonenumber = require('libphonenumber-js');

module.exports = {
  validateCreate: function(input) {
    var response = {};

    if (!input || _.isEmpty(input)) {
      response.error = "Empty contacts are not allowed";
    }

    if (input.email && !Validation.isEmail(input.email)) {
      response.email = "A valid email address is required";
    }

    if (input.work_number && !libphonenumber.isValidNumber(input.work_number)) {
      response.work_number = "A valid phone number is required";
    }

    if (input.home_number && !libphonenumber.isValidNumber(input.home_number)) {
      response.home_number = "A valid phone number is required";
    }

    if (input.cell_number && !libphonenumber.isValidNumber(input.cell_number)) {
      response.cell_number = "A valid phone number is required";
    }

    return Validator.respond(response);
  },
  validateUpdate: function(input) {
    var response = {};

    if (input.email && !Validation.isEmail(input.email)) {
      response.email = "A valid email address is required";
    }

    if (input.work_number && !libphonenumber.isValidNumber(input.work_number)) {
      response.work_number = "A valid phone number is required";
    }

    if (input.home_number && !libphonenumber.isValidNumber(input.home_number)) {
      response.home_number = "A valid phone number is required";
    }

    if (input.cell_number && !libphonenumber.isValidNumber(input.cell_number)) {
      response.cell_number = "A valid phone number is required";
    }

    return Validator.respond(response);
  }
};