'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateAccept: function(req) {
    var input = req.body;
    var response = {};

    if (!input.token) {
      response.token = 'Token is required';
    } else {
      return TeamInvite.pidToId(input.token).then(function(token) {
        return TeamInvite.findOne({
          id: token
        }).then(function(invite) {
          return TeamUser.findOne({
            team: invite.team,
            email: invite.email
          }).then(function(user) {
            if (user.deletedAt) {
              response.invite = "This invite is no longer valid";
            }
            return Validator.respond(response);
          })
        })
      })
    }


    return Validator.respond(response);
  },
  validateInvite: function(req) {
    var response = {};
    var flag = false;
    var self = this;
    var userExistArray = [];


    if (req.body && !Array.isArray(req.body)) {

      response.email = 'email addresses needs to be sent as an array';

    } else if (Array.isArray(req.body)) {
      var flag = false;

      if (req.body.length > 0) {
        _.each(req.body, function(value) {
          if (!Validation.isEmail(value.email)) {
            flag = true;
          }
          userExistArray.push(self._teamUserExist(req.param("id"), value.email)
            .then(function(r) {
              if (r.length > 0) {
                if (response.existingEmail) {
                  response.existingEmail.push(value.email);
                } else {
                  response.existingEmail = [value.email]
                  response.email = 'This user already belongs to a team, please use another email';
                }
              }
            }));
        });
      } else {
        response.email = "No email addresses submitted";
      }

      if (flag) {
        response.email = 'Valid email is required';
      }
      return Promise.all(userExistArray).then(function() {
        return Validator.respond(response);
      });

    }
    return Validator.respond(response);
  },
  validateResendInvite: function(req) {
    var response = {};

    if (req.body.email) {
      if (!Validation.isEmail(req.body.email)) {
        response.email = 'Valid email is required';
      }
    } else {
      response.email = "No email addresses submitted";
    }
    return this._teamInviteExist(req.param("id"), req.body.email)
      .then(function(result) {
        if (result.length <= 0) {
          response.email = 'This user has not invited to the team';
        }
        return response;
      }).then(function() {
        return Validator.respond(response);
      });
  },
  _userExist: function(email) {
    return User.find({
        email: email
      }).then(function(result) {
        return result;
      })
      .catch(function(err) {
        return err;
      });
  },
  _teamUserExist: function(teamId, email) {
    return TeamUser.find({
        email: email
      })

      .then(function(result) {
        return result;
      })
      .catch(function(err) {
        return err;
      });
  },
  _teamInviteExist: function(teamId, email) {
    return Team.pidToId(teamId).then(function(id) {
        return TeamInvite.find({
          team: id,
          email: email
        })

      }).then(function(result) {
        return result;
      })
      .catch(function(err) {
        return err;
      });
  }
};