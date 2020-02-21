'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateEdit: function(req) {
    var response = {};
    var validateUniqueExtension = function() {
      if (req.param('extension')) {
        var team = req.param('teamid');
        var user = req.param('userid');
        return TeamUser.findOne({
          user: user,
          team: team
        }).then(function(user) {
          var team = user.team;
          if (user.extension != req.param('extension') + '') {
            var extension = req.param('extension');
            return CallRoute.rawQuery("SELECT * FROM callroute WHERE extension IN (" + extension + ") AND team = " + team + " AND (owner <> " + user.id + " OR owner IS NULL)").then(function(routes) {
              if (routes && routes.length > 0) {
                var extensions = _.pluck(routes, 'extension');
                response.message = "extension exists in team";
                response.extension = extensions;
              }
              return response;
            });
          } else {
            return response;
          }
        });
      } else {
        return response;
      }
    };

    var finished = function() {
      return Validator.respond(response);
    };

    return Promise.all([validateUniqueExtension()])
      .then(finished);
  },
  validateRemove: function(input) {
    var response = {};

    if (!input || !input.userid) {
      response.id = 'User ID is required';
    }

    return Validator.respond(response);
  }
};