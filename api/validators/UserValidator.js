'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateCreate: function(input) {
    var response = {};

    if (!input || _.isEmpty(input)) {
      response = {
        first_name: 'First Name is required',
        last_name: 'Last Name is required',
        email: 'Email is required',
        password: 'Password is required',
      };

      return Validator.respond(response);

    } else {

      if (!input.first_name) {
        response.first_name = 'First Name is required';
      }

      if (!input.last_name) {
        response.last_name = 'Last Name is required';
      }

      if (input.role !== 'guest') {

        if (!input.password) {
          response.password = 'Password is required';
        } else if (input.password.length < 6) {
          response.password = 'Password length needs to be atleast 6'
        }

      } else if (input.role === 'guest') {

        if (!input.pin) {
          response.pin = 'Pin is required'
        }
      }

      if (!input.email) {
        response.email = 'Email is required';
      } else if (!Validation.isEmail(input.email)) {
        response.email = 'Valid email is required';
      }


      return this._userExist(input.email)
        .then(function(r) {
          if (r.length > 0) {
            response.email = 'User already exists';
          }

          return response;
        }).then(function(response) {
          return Validator.respond(response);
        });

    }
  },
  validateUpdate: function(input) {
    var response = {};

    return Validator.respond(response);
  },
  validateExists: function(input) {
    var response = {};

    return this._userExist(input.email).then(function(r) {
      if (r.length > 0) response.email = 'User already exist';
      return response;
    }).then(function(response) {
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
  }
};