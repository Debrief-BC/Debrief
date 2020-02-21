'use strict';

var Validation = require('validator');
var Validator = require('./Validator');
var Permissions = require('../../config/permissions');

module.exports = {
  validateCreate: function(req) {
    var response = {};
    let instance = this;

    var validateElements = function() {
      return new Promise(function(resolve, reject) {
        if (!req.param('type')) {
          response.type = "type is a required parameter";
        }
        if (!req.param('team') && !req.param('team_slug')) {
          response.team = "team is a required parameter";
        }
        if (!req.param('users')) {
          response.users = "users is a required parameter";
        }
        if (req.param('type') === "private" && !req.isFreeswitch) {
          if (req.param('users').length > 1 || req.param('users').length < 1) {
            response.users = "private chats can only contain one user";
          }
        }
        resolve(response);
      });
    };

    var validateUniqueExtension = function(response) {
      if (req.param('extension')) {
        var extension = req.param('extension');
        return Team.pidToId(req.param('team')).then(function(team) {
          return CallRoute.rawQuery("SELECT * FROM callroute WHERE extension = " + extension + " AND team = " + team).then(function(routes) {
            if (routes && routes.length > 0) {
              response.extension = "extension exists in team";
            }
            return response;
          });
        });
      } else {
        return response;
      }
    };

    var respond = function(response) {
      if ((req.param('type') === 'room' || req.param('type') === 'public_room')) {

        if (!req.param('name')) {
          response.name = "rooms require a name";
        }
        //TODO Remove this restriction for duplicate group names when this feature is applyed
        return instance._chatExist(req.param("team"), req.param("name"))
          .then(function(chat) {
            if (chat) {
              response.name = 'This group name already exists';
            }
            return response;
          })
          .then(function(response) {
            return Validator.respond(response);
          });

      } else {
        return Validator.respond(response);
      }
    };

    return validateElements()
      .then(validateUniqueExtension)
      .then(respond)

  },
  validateUpdate: function(req) {
    var response = {};
    if (req.param('users')) {
      response.users = "you cannot patch chat users through this endpoint. user /chat/:id/users endpoints to add or remove users";
    }

    if (!req.param('id')) {
      response.id = "id is required in the path.";
    }

    if (req.param('locked') && typeof req.param('locked') !== 'boolean') {
      response.locked = 'value should be a boolean';
    }

    var getChatId = function() {
      return Chat.pidToId(req.param("id"));
    };

    var getChat = function(id) {
      return Chat.findOne({
        id: id
      });
    };

    var checkExistingGroup = function(chat) {
      if (req.param("name") && req.param("name") !== chat.name) {
        return Chat.findOne({
            team: chat.team,
            name: req.param("name")
          })
          .then(function(existingChat) {
            if (existingChat) {
              response.name = 'This group name already exists';
            }
            return Validator.respond(response);
          })
      } else {
        return Validator.respond(response);
      }
    };

    return getChatId()
      .then(getChat)
      .then(checkExistingGroup)
  },
  validatePermission: function(team, user, action, category) {
    var getTeamId = function(team) {
      return Team.pidToId(team);
    };

    var getUserRole = function(team) {
      if (user == sails.config.freeswitch.client_id) {
        return "admin";
      }
      return Validator.getUserRole(team, user).then(function(user) {
        return user.role;
      });
    };

    var validate = function(role) {
      var categories = {
        'private': 'private_chat',
        'public_room': 'group_chat',
        'room': 'group_chat',
        'department': 'department'
      };

      return Permissions.chat[action][categories[category]][role];
    };

    return getTeamId(team)
      .then(getUserRole)
      .then(validate);
  },
  _chatExist: function(teamId, name) {
    var getTeamId = function() {
      return Team.pidToId(teamId);
    };
    var getChat = function(team) {
      return Chat.findOne({
        team: team,
        name: name
      });
    };
    return getTeamId().then(getChat);
  }
};