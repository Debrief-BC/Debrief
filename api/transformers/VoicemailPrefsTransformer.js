'use strict';

var Transformer = require('./Transformer');

module.exports = {
  unifyResponse: function(prefs) {
    return Transformer.build(prefs, {
      'id': {
        key: 'id',
        value: VoicemailPrefs.idToPid
      },
      'user': {
        key: 'user',
        value: User.idToPid
      },
      'team': {
        key: 'team',
        value: Team.idToPid
      },
      'greeting': {
        key: 'greeting',
        value: function(v) {
          if (v) {
            return Files.findOne({
              id: v
            }).then(function(file) {
              return file.url;
            });
          } else {
            return null;
          }
        },
      },
      'password': {
        key: 'password',
      },
    });
  },
  unifyRequest: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: VoicemailPrefs.pidToId
      },
      'user': {
        key: 'user',
        value: User.pidToId
      },
      'team': {
        key: 'team',
        value: function(v) {
          return Team.findOne({
            slug: v
          }).then(function(team) {
            if (team) {
              return team.id;
            } else {
              throw {
                errorType: 'notfound',
                response: 'Not found your team'
              };
            }
          });
        }
      },
      'file': {
        key: 'file'
      },
      'password': {
        key: 'password'
      },
    });
  },
};