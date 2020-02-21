'use strict';

var Validation = require('validator');
var Validator = require('./Validator');
var Promise = require('bluebird');

module.exports = {
  validateCreate: function(input) {
    var response = {};

    if (!input.team_name) {
      response.team_name = "Team Name is Required";
    }

    if (!input.owner) {
      response.owner = "Owner is required";
    }

    if (!input.country) {
      response.country = "Country is required";
    }

    return User.pidToId(input.owner).then(function(r) {

        if (r === 0) {
          response.owner = "Owner does not exist. Please create a user first";
        }

        return User.findOne({
          id: r
        }).populate('teams').then(function(user) {
          if (user && user.teams.length > 0) {
            response.owner = 'User already has a team. Please create a different user';
          }

          return response;
        }).catch(function(err) {
          console.log('err', err);
        });
      })
      .then(this._findTeam(input.team_name))
      .then(function(r) {
        if (r.length > 0) {
          response.team_name = 'Team Name is already taken';
        }

        return response;
      })
      .then(function(response) {
        return Validator.respond(response)
      });
  },
  validateUpdate: function() {
    var response = {};

    return Validator.respond(response);
  },
  validateExists: function(input) {
    var response = {};

    return this._findTeam(input.team_name).then(function(r) {
      if (r.length > 0) response.team_name = 'Team Name is already taken';
      return response;
    }).then(function(response) {
      return Validator.respond(response);
    });
  },
  validateAccount: function(input) {
    var response = {};

    if (!input || _.isEmpty(input)) {
      response.billing_contact = 'Company/Contact Name is required',
        response.email = 'Email is required';

    } else {

      if (!input.billing_contact) {
        response.billing_contact = 'Company/Contact Name is required';
      }

      if (!input.email) {
        response.email = 'Email is required';
      }

    }

    return Validator.respond(response);
  },
  validateSubscribe: function(req) {
    var response = {};

    return Validator.respond(response);
  },
  _findTeam: function(team) {
    return Team.find({
      name: team
    });
  },
  _findUser: function(id) {
    return User.findOne({
      id: id
    });
  }
};