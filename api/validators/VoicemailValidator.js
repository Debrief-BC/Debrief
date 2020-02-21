'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateFind: function(req) {
    var response = {};
    Validator.require("userid", req, response);
    Validator.require("slug", req, response);
    return Validator.respond(response);
  },
  validateCreate: function(req) {
    var response = {};
    Validator.require("from", req, response);
    Validator.require("to", req, response);
    Validator.require("type", req, response);

    if (!req.body.type && req.body.type !== "voicemail") {
      response.type = "type is required and must be voicemail";
    }

    if (!req.body.team && !req.body.slug) {
      response.team = "Either a team or a slug is required";
    }

    if (req.body.type === "voicemail" && !req.file) {
      response.file = "No voicemail attached";
    }

    return Validator.respond(response);
  },
  validateUpdate: function(req) {
    var response = {};
    Validator.require('id', req, response);
    return Validator.respond(response);
  },
};