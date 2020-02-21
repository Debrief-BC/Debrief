'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    Validator.require("team", req, response);

    return Validator.respond(response);
  }
};