'use strict';

module.exports = {
  respond: function(response) {
    return new Promise(function(resolve, reject) {
      if (_.isEmpty(response)) {
        resolve(response);
      } else {
        reject({
          errorType: 'validation',
          response: response
        });
      }
    });
  },
  require: function(fieldName, req, res) {
    if (!req.param(fieldName)) {
      res[fieldName] = fieldName + " is a required field";
    }
  },
  getUserRole: function(team, user) {
    if (!user) {
      return 'user is required';
    }

    if (!team) {
      return 'team is required';
    }

    return TeamUser.findOne({
      team: team,
      user: user
    });
  }
};