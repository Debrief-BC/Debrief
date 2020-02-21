'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(req) {
    var response = {};
    if (!req.param('registration_id')) {
      response.registration_id = "registration id is required";
    }

    if (!req.param('device_type')) {
      response.device_type = "device_type is required";
    }

    return Validator.respond(response);
  },
  validateUpdate: function() {
    var response = {};
    return Validator.respond(response);
  },
  validateNotification: function(req) {
    var response = {};

    if (!req.isFreeswitch) {
      throw {
        errorType: 'forbidden',
        response: 'only freeswitch is allowed to send a notification'
      };
    }

    Validator.require("type", req, response);
    Validator.require("team_slug", req, response);

    var from = req.param('from');

    if (from && (!from.user && !from.chat && !from.caller_id_number) || !from) {
      response.from = "from must exist and contain at least a user, a chat or a caller_id_number";
    }

    return Validator.respond(response);
  }
};