'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};

    Validator.require("type", req, response);

    if (req.body.type === "file" && !req.file) {
      response.file = "No file attached";
    }

    return Validator.respond(response);
  },
  validateEdit: function() {
    var response = {};
    return Validator.respond(response);
  }
};