'use strict';

/**
 * ChatUser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'chat_user',
  attributes: {
    user: {
      model: 'teamuser'
    },
    chat: {
      model: 'chat'
    },
    do_not_disturb: {
      type: 'boolean'
    },
    last_seen: {
      type: 'datetime'
    },
    deletedAt: {
      type: 'datetime'
    },
    favorite: {
      type: 'boolean'
    },
    chatType: {
      type: 'string'
    },
    otherUser: {
      model: 'teamuser'
    },
    team: {
      type: 'integer'
    },
    chatName: {
      type: 'string'
    },
    blocked: {
      type: 'boolean'
    }
  },
  beforeCreate: function(values, cb) {
    Chat.findOne({
      id: values.chat
    }).then(function(chat) {
      values.chatType = chat.type;
      values.team = chat.team;
      values.chatName = chat.name;
      cb();
    }).catch(cb);
  },
  findChatsByUsers: function(users, currentUser, favorite, countUnread, includeDnd) {
    var totalUsers = users.length;

    var query = 'SELECT chat FROM (SELECT chat_user.chat, count(*) as count FROM chat_user LEFT JOIN team_user ON chat_user.user = team_user.id WHERE ';
    var queryParams = [];

    if (favorite) {
      query += ' (team_user.user = ? AND chat_userfavorite = ?) ';
      queryParams.push(currentUser);
      queryParams.push(true);
      if (users.length > 1) {
        users.splice(users.indexOf(currentUser), 1);
        query += ' OR team_user.user IN ? ';
        queryParams.push([users]);
      }
    } else {
      query += ' team_user.user IN ? ';
      queryParams.push([users]);
    }

    query += ' GROUP BY chat_user.chat) as chats where count = ?';
    queryParams.push(totalUsers);

    if (includeDnd) {
      query = 'SELECT chat_list.chat '
    }

    if (countUnread) {
      query = 'SELECT chat_last_seen.chat as chat, SUM(CASE WHEN chat_message.createdAt > chat_last_seen.last_seen OR chat_last_seen.last_seen IS NULL THEN 1 ELSE 0 END) as unread FROM (SELECT chat, last_seen, user FROM chat_user LEFT JOIN team_user ON chat_user.user = team_user.id WHERE chat_user.chat IN (' +
        query + ') AND team_user.user = ?) as chat_last_seen LEFT JOIN chat_message ON chat_last_seen.chat = chat_message.chat GROUP BY chat_last_seen.chat;';
      queryParams.push(currentUser);
    }

    return ChatUser.rawQuery(query, queryParams);
  },
  getUnread: function(chatuser) {
    var unreadQuery = function(fullchatuser) {
      var query = 'SELECT count(*) as unread FROM chat_message WHERE chat_message.from <> ? AND chat = ? AND (createdAt >= ? OR ? IS NULL)';
      var queryParams = [fullchatuser.user, fullchatuser.chat, fullchatuser.last_seen, fullchatuser.last_seen];
      return ChatUser.rawQuery(query, queryParams);
    };

    if (chatuser.chat && chatuser.last_seen) {
      return unreadQuery(chatuser);
    } else {
      return ChatUser.findOne({
          id: chatuser.id
        })
        .then(unreadQuery);
    }
  },
  defaultFilter: ['last_seen', 'user', 'chat'],
  defaultPopulate: ['user', 'chat'],

  //Instead of afterUpdate, happens on addUsers in chat model

  afterDestroy: function(records, cb) {
    cb();
    var chats = _.uniq(_.pluck(records, 'chat'));
    ChatUser.find({
      chat: chats
    }).then(function(users) {
      users = _.pluck(users, 'user');
      Search.update({
        users: users
      }, chats[0], 'chat');
    });
    var promises = [];
    records.forEach(function(record) {
      Event.find({
        chat: record.chat,
        user: record.user
      }).then(function(events) {
        if (events) {
          events.forEach(function(event) {
            TeamUser.findOne({
              id: event.user
            }).populate('defaultCalendar').then(function(user) {
              var removeEmail = user.defaultCalendar ? user.defaultCalendar.email : user.email;
              var promise = Event.removeAttendeesEvent(event.id, removeEmail).then(function(result) {
                return Event.destroy({
                  id: event.id
                })
              });
              promises.push(promise);
            });
          });
        }
      })
      Notifications.find({
        user: record.user
      }).populate('message').then(function(notifications) {
        if (notifications) {
          notifications.forEach(function(notification) {
            if (notification.chat === record.chat || (notification.message && notification.message.chat === record.chat)) {
              return Notifications.destroyAndPublish({
                id: notification.id
              });
            }
          })
        }
      })
    })
    Promise.all(promises);
  },
  publishUpdateOverride: function(id, updates, req, options) {
    if (options.previous) {
      var chatid = options.previous.chat;
      return Chat.findOne({
        id: chatid
      }).populate('users').then(function(chat) {
        options.previous.chat = chat;
        var user = options.previous.user;
        let untransformedChat = chat;
        return TransformerService.chatuser.send(options.previous).then(function(previous) {
          options.previous = previous;
          ChatUser.basePublishUpdate(id, updates, req, options);
          if (updates.favorite === true) {
            ChatUser.getUnread({
                id: id,
                user: user,
                chat: chatid,
                last_seen: options.previous.last_seen
              })
              .then(function(count) {
                if (count.length > 0) {
                  previous.chat.unread = count[0].unread;
                }
                User.publish(previous.user, 'user', 'add:favorites', {
                  added: previous.chat,
                  addedId: previous.chat.id,
                  attribute: 'favorites',
                  id: previous.user,
                  verb: 'addedTo'
                });
              });
          } else if (updates.favorite === false) {
            User.publish(previous.user, 'user', 'remove:favorites', {
              removedId: previous.chat.id,
              attribute: 'favorites',
              id: previous.user,
              verb: 'removedFrom'
            });
          } else if (updates.last_seen) {
            var userroom = SessionService.getUserRoom(previous.user);
            User.publish(previous.user, 'chat', 'add:favorites', {
              verb: 'updated',
              id: previous.chat.id,
              chat: previous.chat,
              previous: previous.chat,
              data: {
                'unread': 0
              }
            });
            return TeamUser.findOne({
              id: user
            }).then(teamUser => {
              let fromObj = {
                chat: untransformedChat,
                user: teamUser.user,
                caller_id_name: null,
                caller_id_number: null
              };
              return Team.findOne({
                id: untransformedChat.team
              }).then(team => {
                UserDevice.sendNotification(teamUser.user, fromObj, team, "last_seen", {});
              }).catch(console.log);
            }).catch(console.log);
          }
        });
      });
    } else {
      return ChatUser.basePublishUpdate(id, updates, req, options);
    }
  },
  sendEmail: function(template, user, options) {
    sails.hooks.email.send(
      template, {
        link: sails.config.templateData.feServer + "/gateway/chat/" + options.chatId,
        name: user.firstname,
        invitee: options.invitee.firstname,
        group: options.chat.name
      }, {
        to: user.email,
        subject: "You’ve been added to a group on Debrief"
      },
      function(err) {
        if (err) console.log(err);
      }
    );
  }
};