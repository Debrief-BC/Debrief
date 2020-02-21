'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var input = req.body;
    var response = {};

    if (!input || !input.note) {
      response.note = "Note is required";
    }

    return Note.findOne({
      owner: req.user
    }).then(function(note) {
      if (note) {
        response.note = 'User already have a note please update existing note';
      }
    }).then(function() {
      return Validator.respond(response);
    });
  },
  validateUpdate: function(req) {
    var response = {};
    return Validator.respond(response);
  }
};