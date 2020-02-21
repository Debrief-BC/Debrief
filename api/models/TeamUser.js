'use strict';

/**
 * UserCompany.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'team_user',
  attributes: {
    user: {
      model: 'user'
    },
    team: {
      model: 'team'
    },
    role: {
      type: 'integer'
    },
    plan: {
      model: 'plan'
    },
    addon: {
      model: 'addon'
    },
    position: {
      type: 'string'
    },
    deletedAt: {
      type: 'datetime'
    },
    accepted: {
      type: 'datetime'
    },
    lastLogin: {
      type: 'datetime'
    },
    invitedBy: {
      type: 'string'
    },
    defaultCalendar: {
      model: 'integration',
      defaultsTo: '0'
    },
    defaultContacts: {
      model: 'integration',
      defaultsTo: '0'
    },
    email: {
      type: 'string',
    },
    firstname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    avatar: {
      type: 'string'
    },
    color: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    state: {
      type: 'string'
    },
    extension: {
      type: 'json'
    },
    notification: {
      type: 'boolean',
      defaultsTo: true
    },
    routes: {
      collection: 'callroute',
      via: 'owner'
    },
    chats: {
      collection: 'chat',
      via: 'user',
      through: 'chatuser'
    },
    deletedUser: {
      type: 'integer'
    },
    workNumber: {
      type: 'string'
    },
    homeNumber: {
      type: 'string'
    },
    mobileNumber: {
      type: 'string'
    },
    website: {
      type: 'string'
    },
    caller_id_name: {
      type: 'string'
    },
    caller_id_number: {
      type: 'string'
    },
    voicemail: {
      type: 'boolean',
      defaultsTo: false
    },
    forward: {
      type: 'boolean',
      defaultsTo: false
    },
    forward_number: {
      type: 'string'
    },
    latitude: {
      type: 'string'
    },
    longitude: {
      type: 'string'
    },
    theme: {
      type: 'text',
      defaultsTo: 'dark'
    },
    thumb_url: {
      type: 'string'
    }
  },
  defaultFilter: ['team', 'user', 'plan', 'accepted', 'email'],
  defaultPopulate: ['user', 'team', 'plan', 'routes'],
  totalUsersInTeam: function(id) {
    return TeamUser.count({
      team: id
    });
  },
  totalUnlimitedUsers(id) {
    return TeamUser.query('SELECT * FROM team_user WHERE team = ' + id);
  },
  totalLimitedUsers() {
    return TeamUser.query('SELECT * FROM team_user WHERE team = ' + id);
  },
  updatePlan(plan, teamId, req) {
    return TeamUser.updateAndPublish({
      id: teamId
    }, {
      plan: plan
    }, req);
  },
  beforeCreate(values, cb) {
    User.findOne({
      id: values.user
    }).then(function(usr) {
      values.email = usr.email;
      values.firstname = usr.firstname;
      values.lastname = usr.lastname;
      values.avatar = usr.avatar;
      values.color = usr.color;
      values.status = usr.status;
      values.state = usr.state;
      cb();
    }).catch(cb);
  },
  afterCreate(created, cb) {
    cb();
    if (created.role !== sails.config.guestRoleIndex) {
      Search.create({
          email: created.email,
          firstname: created.firstname,
          lastname: created.lastname,
          team: created.team
        },
        created.id,
        "user");
    }
  },
  afterUpdate(updated, cb, old) {
    cb();

    if (updated.role !== sails.config.guestRoleIndex) {
      Search.update({
          email: updated.email,
          firstname: updated.firstname,
          lastname: updated.lastname,
          team: updated.team
        },
        updated.id,
        "user");
    }
  },
  afterDestroy(deleted, cb) {
    cb();
    Search.destroy(deleted.id, 'user');
  },
  publishAddOverride(id, alias, added, req) {
    switch (alias) {
      case 'chats':
        var chat = null;
        var teamuser = null;

        var findChatUser = function() {
          return ChatUser.findOne({
            id: added
          }).populate('user');
        };

        var findChat = function(chatUser) {
          teamuser = chatUser.user;
          return Chat.findOne({
            id: chatUser.chat
          }).populate('users');
        };

        var idToPid = function(c) {
          chat = c;
          return User.idToPid(teamuser.user);
        };

        var publish = function(user) {
          return User.publish(user, 'user', 'add:chats', {
            added: chat,
            addedId: chat.id,
            attribute: 'chats',
            id: user,
            verb: 'addedTo'
          }, req);
        };

        return findChatUser()
          .then(findChat)
          .then(TransformerService.chat.send)
          .then(idToPid)
          .then(publish)
          .catch(console.error);
      default:
        TeamUser.basePublishAdd(id, alias, added, req);
        break;
    }
  },
  publishRemoveOverride(id, alias, item, req, options) {
    switch (alias) {
      case 'chats':
        if (options.previous) {
          var chat = Chat.idToPidSync(options.previous.chat);
          TeamUser.findOne({
            id: id
          }).then(function(teamuser) {
            var uid = User.idToPidSync(teamuser.user);
            User.publish(uid, 'user', 'remove:chats', {
              removedId: chat,
              attribute: 'chats',
              id: uid,
              verb: 'removedFrom'
            }, req);
          });
        }
        break;
      default:
        TeamUser.basePublishRemove(id, alias, item, req, options);
        break;
    }
  },
  publishUpdateOverride(id, updates, req, options) {
    var getUserId = function() {
      return TeamUser.findOne({
        id: id
      }).then(function(teamUser) {
        return User.findOne({
          id: teamUser.user
        }).then(function(user) {
          return User.idToPid(user.id);
        })
      })
    }

    var publishUpdates = function(userId) {
      TransformerService.teamuser.send(updates).then(function(transformed) {
        if (options.previous) {
          TransformerService.teamuser.send(options.previous).then(function(previous) {
            options.previous = previous;
            TeamUser.basePublishUpdate(userId, transformed, req, options);
          });
        } else {
          TeamUser.basePublishUpdate(userId, transformed, req, options);
        }
      });
    }
    getUserId()
      .then(publishUpdates)
  },
  sendEmail(template, user, options, password) {
    sails.hooks.email.send(
      template, {
        link: sails.config.templateData.feServer,
        team: options.team.name,
        name: user.firstname,
        invitee: options.invite ? options.invite.firstname + 'on' : '',
        password: password,
        login: user.email
      }, {
        to: user.email,
        subject: "You have been invited to " + options.team.name + " on Debrief!"
      },
      function(err) {
        if (err) console.log(err);
      }
    );
  }
};