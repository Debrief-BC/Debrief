'use strict';

var Request = require('request-promise');

module.exports = {
  auth: function() {
    var body = {
      grant_type: "client_credentials",
      client_id: sails.config.auth_api.client_id,
      client_secret: sails.config.auth_api.client_secret
    };

    var host = sails.config.auth_api.url;
    var endpoint = '/login-client';
    var method = 'POST';

    return this.buildOptions(host, method, endpoint, body)
      .then(Request)
      .then(function(r) {
        return r;
      })
      .catch(function(e) {
        return e;
      });
  },
  buildOptions: function(host, method, endpoint, body) {
    var options = {
      uri: host + endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body,
      json: true
    };

    return new Promise(function(resolve, reject) {
      resolve(options)
    });
  },
  exec: function(options) {
    var addAuthToRequest = function(result) {
      options.headers.authorization = result.token_type + ' ' + result.access_token;
      return options;
    };

    return this.auth().then(addAuthToRequest).then(Request);
  }
};