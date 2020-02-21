'use strict';

//var Q = require('q');

module.exports = {
  attributes: {
    email: {
      type: 'string',
    },
    extensionSecret: {
      type: 'string',
      defaultsTo: function() {
        var possible_symbols = "abcdefghijklmnopqrstuvwxyz1234567890";
        var password = "";
        for (var i = 0; i < 6; i++) {
          password += possible_symbols[Math.floor(Math.random() * possible_symbols.length)];
        }
        return password;
      }
    },
    firstname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    deletedAt: {
      type: 'datetime'
    },
    teams: {
      collection: 'team',
      via: 'users',
      through: 'teamuser'
    },
    status: {
      type: 'string',
      defaultsTo: 'active'
    },
    state: {
      type: 'string',
      defaultsTo: 'offline'
    },
    tours: {
      type: 'json'
    },
    devices: {
      collection: 'userdevice',
      via: 'user'
    },
    avatar: {
      type: 'string'
    },
    color: {
      type: 'string',
      defaultsTo: function() {
        return sails.config.avatarColors[Math.floor(Math.random() * sails.config.avatarColors.length)];
      }
    },
    language: {
      type: 'string'
    },
    timezone: {
      type: 'string'
    },
    timeformat: {
      type: 'string'
    },
    dateformat: {
      type: 'string'
    },
    tooltips: {
      type: 'boolean',
      defaultsTo: true
    }
  },
  defaultFilter: ['id', 'email', 'extension', 'firstname', 'lastname', 'status'],
  defaultSearch: ['email', 'firstname', 'lastname'],
  defaultPopulate: ['teams'],

  // createUser: function(data) {
  //   var deferred = Q.defer();

  //   // Get hashed password
  //   this.getPasswordHash(data.password).then(function(hash) {
  //     data.password = hash;
  //     // Create user
  //     this.create(data).exec(function(err, user) {
  //       deferred.resolve(user);
  //     });
  //   });

  //   return deferred.promise;
  // },

  publishUpdateOverride: function(id, updates, req, options) {
    var teamuserUpdate = {};
    if (updates.email) teamuserUpdate.email = updates.email;
    if (updates.firstname) teamuserUpdate.firstname = updates.firstname;
    if (updates.lastname) teamuserUpdate.lastname = updates.lastname;
    if (updates.avatar) teamuserUpdate.avatar = updates.avatar;
    if (updates.color) teamuserUpdate.color = updates.color;
    if (updates.status) teamuserUpdate.status = updates.status;
    if (updates.state) teamuserUpdate.state = updates.state;

    if (Object.keys(teamuserUpdate).length > 0) {
      TeamUser.updateAndPublish({
        user: id
      }, teamuserUpdate);
    }

    TransformerService.user.send(updates).then(function(transformed) {
      if (options.previous) {
        TransformerService.user.send(options.previous).then(function(previous) {
          options.previous = previous;
          User.basePublishUpdate(id, transformed, req, options);
        });
      } else {
        User.basePublishUpdate(id, transformed, req, options);
      }
    });
  },
  createUserOnAuth: function(user) {

    var buildOptions = function(id) {
      var host = sails.config.auth_api.url;
      var endpoint = '/user';
      var method = 'POST';
      var body = {
        email: user.email,
        password: user.password,
        pid: id
      };

      return ApiService.buildOptions(host, method, endpoint, body);
    };

    var executeOnAuth = function(options) {
      return ApiService.exec(options)
        .then(function(r) {
          return user;
        })
        .catch(function(e) {
          return e;
        });
    };

    return User.idToPid(user.id)
      .then(buildOptions)
      .then(executeOnAuth)
      .catch(function(e) {
        console.log(e);
      });
  },
  loginUser: function(opts) {
    var buildOptions = function(id) {
      var host = sails.config.auth_api.url;
      var endpoint = '/login-user';
      var method = 'POST';
      var body = {
        grant_type: 'password',
        username: opts.email,
        password: opts.password,
        client_id: sails.config.auth_api.client_id,
        client_secret: sails.config.auth_api.client_secret
      };

      return ApiService.buildOptions(host, method, endpoint, body)
    };

    var executeOnAuth = function(options) {
      return ApiService.exec(options);
    };

    return buildOptions().then(executeOnAuth);
  }

};


/**
 * @apiDefine minimalUser
 * @apiSuccess (user) {string} id
 * @apiSuccess (user) {String/null} status the users status (online, offline, busy, etc)
 * @apiSuccess (user) {Object/null} tours object representing the users tour status
 * @apiSuccess (user) {string} email
 * @apiSuccess (user) {string} firstname
 * @apiSuccess (user) {string} lastname
 * @apiSuccess (user) {string} extension
 * @apiSuccess (user) {string} status
 * @apiSuccess (current_user) {Chat[]} favorites
 * @apiSuccess (current_user) {Chat[]} tours
 */

/**
 * @apiDefine fullUser
 *
 * @apiSuccess (current_user) {Team[]} teams
 * @apiSuccess (current_user) {Chat[]} chats
 * @apiSuccess (current_user) {Chat[]} devices
 */