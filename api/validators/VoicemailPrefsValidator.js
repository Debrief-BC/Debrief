'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateFind: function(req) {
    var response = {};
    Validator.require("user", req, response);
    Validator.require("team", req, response);
    return Validator.respond(response);
  },
  validateChangePassword: function(req) {
    var response = {};
    Validator.require("user", req, response);
    Validator.require("team", req, response);
    Validator.require("password", req, response);
    return Validator.respond(response);
  },

  validateChangeGreeting: function(req) {
    var response = {};
    Validator.require("user", req, response);
    Validator.require("team", req, response);
    return Validator.respond(response);
  },
};