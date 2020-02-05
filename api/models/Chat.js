'use strict';

/**
 * Chat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    purpose: {
      type: 'string'
    },
    type: {
      type: 'string',
      required: true
    },
    owner: {
      model: 'teamuser'
    },
    locked: {
      type: 'boolean',
      defaultsTo: true
    },
    url: {
      type: 'string',
    },
    pin: {
      type: 'integer'
    },
    roomNumber: {
      type: 'integer',
      unique: true,
      required: true
    },
    team: {
      model: 'team'
    },
    messages: {
      collection: 'chatMessage',
      via: 'chat'
    },
    users: {
      collection: 'teamuser',
      via: 'chat',
      through: 'chatuser'
    },
    links: {
      collection: 'links',
      via: 'chat',
      through: 'chatlinks'
    },
    files: {
      collection: 'files',
      via: 'chat'
    },
    callcenter_ring: {
      type: 'string'
    },
    callcenter_voicemail_password: {
      type: 'string'
    },
    callcenter_transfer_to: {
      model: 'callroute'
    },
    callcenter_max_time: {
      type: 'int'
    },
    callcenter_hold_music: {
      type: 'string'
    },
    routes: {
      collection: 'callroute',
      via: 'room'
    },
    last_message_time: {
      type: 'datetime'
    },
    deletedAt: {
      type: 'datetime'
    },
    color: {
      type: 'string',
      defaultsTo: function() {
        return sails.config.avatarColors[Math.floor(Math.random() * sails.config.avatarColors.length)];
      }
    },
    avatar: {
      type: 'string'
    },
    conf_pin: {
      type: 'integer'
    }
  },
  EncryptionSettings: {
    password: "c" + EncryptionService.settings.password
  },
  findPrivateChat: function(users, team) {
    return TeamUser.find({
      user: users,
      team: team
    }).then(function(teamusers) {
      if (teamusers.length == 2) {
        return ChatUser.findOne({
          chatType: 'private',
          team: team,
          user: teamusers[0].id,
          otherUser: teamusers[1].id
        }).populate('chat').then(function(chatuser) {
          if (!chatuser) return null;
          return chatuser.chat;
        });
      }
    });
  },
  addUsers: function(chat, users) {
    if (Array.isArray(chat)) {
      chat = chat[0];
    }
    return TeamUser.find({
      team: chat.team,
      user: users
    }).then(function(teamusers) {
      var promises = [];
      teamusers.forEach(function(u) {
        var user = {
          user: u,
          chat: chat.id
        };
        if (chat.type === 'private' && teamusers.length == 2) {
          if (teamusers[0] = u) user.otherUser = teamusers[1];
          else user.otherUser = teamusers[0];
        }
        promises.push(ChatUser.addAndPublish(user));
      });
      return Promise.all(promises).then(function() {
        return ChatUser.find({
          chat: chat.id
        }).then(function(users) {
          users = _.pluck(users, 'user');
          return Search.update({
            users: users
          }, chat.id, 'chat');
        });
      });
    });
  },

  createChat(options, req) {

    var createChat = function() {
      return Chat.find({
        sort: 'id DESC',
        limit: 1
      }).then(function(chat) {

        var newChat = {
          name: options.name,
          purpose: options.purpose,
          type: options.type,
          team: options.team,
          owner: options.owner,
          locked: options.locked,
          url: options.url,
          pin: options.pin,
          callcenter_voicemail_password: options.callcenter_voicemail_password,
          callcenter_ring: options.callcenter_ring,
          callcenter_transfer_to: options.callcenter_transfer_to,
          callcenter_hold_music: options.callcenter_hold_music,
          callcenter_max_time: options.callcenter_max_time,
          conf_pin: Math.floor(Math.random() * 90000) + 10000,
          roomNumber: chat[0] ? chat[0].roomNumber + 1 : 10001
        };

        if (options.type == "department") {
          newChat.callcenter_ring = newChat.callcenter_ring || 'ring-all';
        }

        return Chat.createAndPublish(newChat, req);
      });
    };

    var createCallRoute = function(chat) {
      if (chat.type == "department") {
        if (options.extension) {
          return CallRoute.createDepartmentRoute(chat, chat.team, {
            extension: options.extension
          }).then(function(callRoute) {
            chat.extension = callRoute.extension
            return chat;
          })
        } else {
          return CallRoute.createDepartmentRoute(chat, chat.team, {
            start_extension: 100
          }).then(function(callRoute) {
            chat.extension = callRoute.extension
            return chat;
          })
        }
      } else {
        return chat;
      }
    };


    var addUsers = function(chat) {
      return Chat.addUsers(chat, options.users).then(function() {
        return chat;
      })
    };

    var createPrivateChat = function() {
      return Chat.findPrivateChat(options.users, options.team)
        .then(function(chat) {
          if (chat) {
            return chat;
          } else {
            return createChat()
              .then(addUsers);
          }
        });
    };

    if (options.type === 'private') {
      return createPrivateChat();
    } else {
      return createChat()
        .then(createCallRoute)
        .then(addUsers);
    }
  },
  defaultFilter: ['name', 'type', 'team', 'owner', 'last_message_time'],
  defaultPopulate: ['users', 'meetings', 'owner', 'team', 'links', 'files', 'callcenter_transfer_to', 'routes', 'blocked'],
  defaultSubscribe: ['users', 'messages'],
  defaultSearch: ['name'],

  findChats: function(currentUser, team, type, last_message_time_from, last_message_time_to, name, users, favoriteOnly, sort, skip, limit) {
    var queryParams = [];
    var totalUsers = Array.isArray(users) ? users.length : 0;
    var query = "SELECT chat.*, cur_chat_user.favorite, cur_chat_user.do_not_disturb, cur_chat_user.last_seen ";
    if (users) query += " ,count(*) as numusers ";
    query += " FROM chat LEFT JOIN chat_user as cur_chat_user ON cur_chat_user.chat = chat.id LEFT JOIN team_user as cur_user ON cur_chat_user.user = cur_user.id ";

    if (users) {
      query += " LEFT JOIN chat_user ON chat_user.chat = chat.id LEFT JOIN team_user ON team_user.id = chat_user.user WHERE team_user.user IN ? AND cur_user.user = ?";
      queryParams.push([users]);
      queryParams.push(currentUser);
    } else {
      query += " WHERE cur_user.user = ? ";
      queryParams.push(currentUser);
    }

    if (team) {
      if (Array.isArray(team)) {
        query += ' AND chat.team IN ? ';
        queryParams.push([team]);
      } else {
        query += ' AND chat.team = ? ';
        queryParams.push(team);
      }
    }

    if (type) {
      if (Array.isArray(type)) {
        query += ' AND chat.type IN ? ';
        queryParams.push([type]);
      } else {
        query += ' AND chat.type = ? ';
        queryParams.push(type);
      }
    }

    if (name) {
      query += ' AND chat.name like ? ';
      queryParams.push("%" + name + "%");
    }

    if (favoriteOnly) {
      query += ' AND cur_chat_user.favorite = "1" ';
    }

    if (last_message_time_from) {
      query += ' AND (last_message_time > ? OR (last_message_time IS NULL AND chat.createdAt > ? )) ';
      queryParams.push(last_message_time_from);
      queryParams.push(last_message_time_from);
    }

    if (last_message_time_to) {
      query += ' AND last_message_time < ? ';
      queryParams.push(last_message_time_to);
    }

    query += " group by chat.id, cur_chat_user.favorite, cur_chat_user.do_not_disturb, cur_chat_user.last_seen";

    if (users) {
      queryParams.push(totalUsers);
      query = 'SELECT * FROM (' + query + ') as chats_pre_users WHERE chats_pre_users.numusers = ? ';
    }

    if (sort) {
      query += " ORDER BY " + sort;
    }

    limit = Number(limit) || 30;
    if (limit) {
      query += " LIMIT  ?";
      queryParams.push(limit);
    }

    if (skip) {
      skip = Number(skip);
      query += " OFFSET ? ";
      queryParams.push(skip);
    }

    return Chat.rawQuery(query, queryParams);
  },

  afterCreate: function(chat, cb) {
    Search.create({
        name: chat.name,
        users: [],
        team: chat.team,
        type: chat.type
      },
      chat.id,
      "chat");
    cb();
  },

  afterUpdate: function(updated, cb) {
    cb();

    Chat.findOne({
      id: updated.id
    }).populate('users').then(function(chat) {
      var users = _.pluck(chat.users, 'id');
      Search.update({
        name: chat.name,
        type: chat.type,
        team: chat.team,
        users: users
      }, chat.id, 'chat');
    });
  },

  afterDestroy: function(deleted, cb) {
    cb();
    Search.destroy(deleted.id, 'chat');
  },

  publishAddOverride: function(id, alias, added, req) {
    switch (alias) {
      case 'messages':
        ChatUser.find({
          chat: id
        }).populate('user').then(function(users) {

          return TransformerService.chatmessage.send(added).then(function(r) {
            var promises = [];
            users.forEach(function(chatUser, index) {
              if (chatUser.user) {
                promises.push(Chat.subscribeUser(chatUser.user.user, id, ['message', 'update', 'destroy', 'add:messages', 'add:users', 'remove:users']));
              }
            }, this);

            return Promise.all(promises).then(function() {
              return Chat.basePublishAdd(id, alias, r, req);
            }).catch(console.error);
          });
        });
        break;
      case 'users':
        ChatUser.findOne({
          id: added
        }).populate(['user', 'chat']).then(function(chatUser) {
          var tpromise = TransformerService.chatuser.send(chatUser).then(function(r) {
            return Chat.basePublishAdd(id, alias, r, req, {
              noReverse: true
            });
          });

          Chat.subscribeUser(chatUser.user.user, id, ['message', 'update', 'destroy', 'add:messages', 'add:users', 'remove:users']);

          return Promise.all([tpromise]);
        });
        break;
      default:
        Chat.basePublishAdd(id, alias, added, req);
        break;
    }
  },
  publishRemoveOverride: function(id, alias, item, req, options) {
    switch (alias) {
      case 'users':
        var userid = options.previous.user;
        TransformerService.chatuser.send(options.previous).then(function(chatuser) {
          options.previous = chatuser;
          Chat.basePublishRemove(id, alias, chatuser.user, req, options);
        });
        TeamUser.findOne({
          id: userid
        }).then(function(teamuser) {
          Chat.unsubscribeUser(teamuser.user, id, ['message', 'update', 'destroy', 'add:messages', 'add:users', 'remove:users']);
        });
        break;
      default:
        Chat.basePublishRemove(id, alias, item, req, options);
        break;
    }
  },
  publishUpdateOverride: function(id, updates, req, options) {


    if (updates.type) ChatUser.update({
      chat: id
    }, {
      chatType: updates.type
    }).exec(function() {});
    if (updates.team) ChatUser.update({
      chat: id
    }, {
      team: updates.team
    }).exec(function() {});
    if (updates.name) ChatUser.update({
      chat: id
    }, {
      chatName: updates.name
    }).exec(function() {});

    if (options.previous) {
      TransformerService.chat.send(options.previous).then(function(previous) {
        options.previous = previous;
        TransformerService.chat.send(updates).then((updates) => {
          Chat.basePublishUpdate(id, updates, req, options);
        });
      });
    } else {
      TransformerService.chat.send(updates).then((updates) => {
        Chat.basePublishUpdate(id, updates, req, options);
      });
    }
  }
};

/**
 * @apiDefine minimalChat
 *
 * @apiSuccess (Chat) {string} name
 * @apiSuccess (Chat) {string} type either "private", "room", "public_room" or "pstn"
 * @apiSuccess (Chat) {integer} id
 * @apiSuccess (Chat) {Team} team
 * @apiSuccess (Chat) {User} owner
 */

/**
 * @apiDefine fullChat
 *
 * @apiSuccess (Chat) {Message[]} messages
 * @apiSuccess (Chat) {User[]} users
 * @apiSuccess (Chat) {Meeting[]} meetings
 * @apiSuccess (Chat) {int} unread
 *
 */