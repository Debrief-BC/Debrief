'use strict';

var Transformer = require('./Transformer');
var Promise = require('bluebird');
var request = require('request-promise');

module.exports = {
  send: function(user, isCurrentUser) {
    if (!isCurrentUser && user) {
      delete user.favorites;
      delete user.teams;
      delete user.devices;
      delete user.chats;
      delete user.tours;
      delete user.extensionSecret;
    }
    return Transformer.build(user, {
      'id': {
        key: 'id',
        value: User.idToPid
      },
      'email': {
        key: 'email',
        value: (email, rtnObj, srcObj) => {
          return TeamUser.findOne({
              user: srcObj.id
            })
            .then(teamUser => {
              if (teamUser && teamUser.role == sails.config.guestRoleIndex) {
                return GuestInvite.findOne({
                  user: teamUser.user
                }).then(guest => {
                  return guest.email;
                }).catch(err => {
                  throw new Error(err);
                });
              } else {
                return email;
              }
            }).catch(err => {
              throw new Error(err);
            });
        }
      },
      'teams': {
        key: 'teams',
        value: TransformerService.team.send
      },
      'status': {
        key: 'status'
      },
      'extension': 'extension',
      'extensionSecret': {
        key: 'extensionSecret'
      },
      'firstname': {
        key: 'first_name'
      },
      'lastname': {
        key: 'last_name'
      },
      'createdAt': {
        key: 'created_at'
      },
      'favorites': {
        key: 'favorites',
        value: TransformerService.user.send
      },
      'devices': {
        key: 'devices',
        value: TransformerService.userdevice.send
      },
      'chats': {
        key: 'chats',
        value: TransformerService.chat.send
      },
      'avatar': {
        key: 'avatar'
      },
      'tours': {
        key: 'tours'
      },
      'state': 'state',
      'color': 'color',
      'notification': {
        key: 'notification'
      },
      'language': 'language',
      'timezone': 'timezone',
      'timeformat': 'timeformat',
      'dateformat': 'dateformat',
      'call_options': {
        key: 'call_options'
      },
      'tooltips': "tooltips",
      'latitude': {
        key: 'latitude'
      },
      'longitude': {
        key: 'longitude'
      },
      'pickupGroup': {
        key: 'pickupGroup'
      }
    });
  },

  sendUserOrPid: function(usersorids) {
    if ((Array.isArray(usersorids) && typeof usersorids[0] === 'object') || typeof usersorids === 'object' && !Array.isArray(usersorids)) {
      return TransformerService.user.send(usersorids);
    } else {
      return User.idToPid(usersorids);
    }
  },

  get: function(req) {
    /**
     * Default user creation role to admin
     * if one is not provided (Assuming this is the first user)
     */

    if (req.body && !req.body.role) {
      req.body.role = "admin";
    }

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: User.pidToId
      },
      'email': {
        key: 'email'
      },
      'password': {
        key: 'password'
      },
      'status': {
        key: 'status'
      },
      'role': {
        key: 'role',
        value: function(role) {
          return Object.keys(sails.config.roles).find(function(r) {
            return sails.config.roles[r] === role;
          });
        }
      },
      'extension': {
        key: 'extension'
      },
      'first_name': {
        key: 'firstname'
      },
      'last_name': {
        key: 'lastname'
      },
      'tours': {
        key: 'tours'
      },
      'current-team': {
        key: 'current-team',
        value: Team.pidToId
      },
      'state': 'state',
      'file': 'file',
      'avatar': 'avatar',
      'color': 'color',
      'language': 'language',
      'timezone': 'timezone',
      'timeformat': 'timeformat',
      'dateformat': 'dateformat',
      'slug': "slug",
      'tooltips': "tooltips",
      'latitude': {
        key: 'latitude'
      },
      'longitude': {
        key: 'longitude'
      },
      'pickupGroup': {
        key: 'pickupGroup'
      }
    });
  }
};