'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCharge: function(req) {
    var response = {};

    Validator.require('slug', req, response);
    Validator.require('tick_length', req, response);
    Validator.require('direction', req, response);
    Validator.require('pstn_number', req, response);

    return Validator.respond(response);
  },
};