'use strict';

const google = require('googleapis');
const googleTranslate = google.translate('v2');
const requestImageSize = require('request-image-size');

/**
 * ChatMessage.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'chat_message',
  attributes: {
    from: {
      model: 'teamuser'
    },
    type: {
      type: 'string',
      required: true
    },
    body: {
      type: 'json'
    },
    chat: {
      model: 'chat',
      required: true
    },
    attachment: {
      type: 'json'
    },
    file: {
      model: 'files'
    },
    links: {
      model: 'links'
    },
    deletedAt: {
      type: 'datetime'
    },
    user_mentions: {
      collection: 'teamuser',
      via: 'user',
      through: 'usermention'
    },
    room_mentions: {
      collection: 'chat',
      via: 'room',
      through: 'roommention'
    }
  },
  defaultFilter: ['id', 'type', 'body', 'createdAt', 'from', 'file', 'links'],
  defaultPopulate: ['from', 'file', 'links', 'user_mentions', 'room_mentions'],
  defaultSearch: ['body'],

  /**
   * AfterCreate
   */
  afterCreate(created, cb) {
    var getMatches = function(regex, string) {
      var match = regex.exec(string);
      var result = [];
      while (match != null) {
        result.push(match[1]);
        match = regex.exec(string);
      }
      return result;
    }
    ChatMessage.findOne({
      id: created.id
    }).populate('chat').then(function(message) {
      if (message.chat.type !== "department") {
        TeamUser.findOne({
          id: created.from
        }).then((from) => {
          var notifications = [];
          ChatUser.find({
            chat: created.chat
          }).then((chatusers) => {
            chatusers.forEach((chatuser) => {
              if (created.from !== chatuser.user || created.type === 'participant_added') {
                switch (created.type) {
                  case 'file':
                    var notification = {
                      type: 'file',
                      user: chatuser.user,
                      team: chatuser.team,
                      file: created.file,
                      message: created.id,
                      chat: created.chat,
                      read: false
                    }
                    notifications.push(notification);
                    break;

                  case 'participant_left':
                  case 'participant_removed':
                    if (from && from.user !== chatuser.user) {
                      if (from.role !== sails.config.guestRoleIndex) {
                        var notification = {
                          type: created.type,
                          user: chatuser.user,
                          team: chatuser.team,
                          message: created.id,
                          chat: created.chat,
                          read: false
                        }
                        notifications.push(notification);
                      }
                    }
                    break;
                  case 'participant_added':
                  case 'chat_locked':
                    if (from && from.role !== sails.config.guestRoleIndex) {
                      var notification = {
                        type: created.type,
                        user: chatuser.user,
                        team: chatuser.team,
                        message: created.id,
                        chat: created.chat,
                        read: false
                      }
                      notifications.push(notification);
                    }
                    break;
                  case 'chat_avatar':
                    var notification = {
                      type: 'chat_avatar',
                      user: chatuser.user,
                      team: chatuser.team,
                      file: created.file,
                      message: created.id,
                      chat: created.chat,
                      read: false
                    }
                    notifications.push(notification);
                    break;
                }
              }
            })
            Notifications.createAndPublish(notifications);
          })
        })
      }
    })


    ChatMessage.findOne({
      id: created.id
    }).populate("chat").populate("from").then(function(message) {
      var parseAtMentions = function() {
        if (created.type === 'file' || typeof created.body !== 'string') return;
        created.body = unescape(created.body);

        if (typeof created.body !== 'string') {
          created.body = JSON.stringify(created.body);
        }
        var user_ids = getMatches(/\<mention\s*user=\"([a-z0-9]*)/g, created.body);
        var room_ids = getMatches(/\<mention\s*room=\"([a-z0-9]*)/g, created.body);


        var promises = [];
        var chat = created.chat;
        var team = message.chat.team;

        if (user_ids && user_ids.length > 0) {
          user_ids = User.pidToIdSync(user_ids);
          var p = TeamUser.find({
            user: user_ids,
            team: team
          }).then(function(teamusers) {
            var teamuser_ids = _.pluck(teamusers, 'id');
            var promises2 = [];
            teamuser_ids.forEach(function(id) {
              var pr = UserMention.create({
                user: id,
                message: created.id,
                chat: chat,
                team: team
              });
              promises2.push(pr);
            });

            return Promise.all(promises2);
          });
          promises.push(p);
        }

        if (room_ids && room_ids.length > 0) {
          room_ids = Chat.pidToIdSync(room_ids);

          room_ids.forEach(function(id) {
            var pr = RoomMention.create({
              room: id,
              message: created.id,
              chat: chat,
              team: team
            });
            promises.push(pr);
          });
        }

        return Promise.all(promises);
      }

      parseAtMentions()
      /*.then(function() {
      				cb();
      			}).catch(cb);*/

      if (message.type === "text") {
        var bodyobj = {
          val: {
            message: message.body
          }
        };
        var createOnSearch = Search.create({
            from: message.from.id,
            body: bodyobj,
            team: message.chat.team,
            type: message.type
          },
          message.id,
          'chat_message_chat',
          message.chat.id);
      }
      var updateChatLastMessageTime = Chat.updateAndPublish({
        id: message.chat.id
      }, {
        last_message_time: new Date()
      });
      var updateChatUsers = ChatUser.updateAndPublish({
        chat: message.chat.id
      }, {
        favorite: true
      });
      return Promise.all([createOnSearch, updateChatLastMessageTime, updateChatUsers]);
    }).then(function(response) {
      cb();
    }).catch(function(response) {
      cb();
    });
  },
  afterUpdate(updated, cb) {
    cb();
    ChatMessage.findOne({
      id: updated.id
    }).populate("chat").populate("from").then(function(message) {
      var bodyobj = {
        val: message.body
      };
      return Search.create({
          from: message.from.id,
          body: bodyobj,
          team: message.chat.team,
          type: message.type
        },
        message.id,
        'chat_message_chat',
        message.chat.id);
    }).then(function() {}).catch(console.error);
  },
  afterDestroy(deleted, cb) {
    cb();
    Search.destroy(deleted.id, 'chat_message_chat', deleted.chat);
  },
  publishCreateOverride(item, req) {
    ChatMessage.findOne({
      id: item.id
    }).populate('chat').populate('from').populate('file').populate('links').populate('user_mentions').populate('room_mentions').then(function(message) {
      if (message.type == "call_log" && message.body.to !== null) {
        TeamUser.findOne({
          team: message.chat.team,
          user: message.body.to
        }).then(function(user) {
          if (!user) return Chat.publishAdd(item.chat, 'messages', message, req);
          message.body.to = user;
          Chat.publishAdd(item.chat, 'messages', message, req);
          ChatMessage.pushNotification(message);
        })
      } else if (message.type == 'participant_added' || message.type == 'participant_removed' || message.type == 'participant_left') {
        TeamUser.find({
          team: message.chat.team,
          user: message.body
        }).then(function(users) {
          message.body = users;
          Chat.publishAdd(item.chat, 'messages', message, req);
          ChatMessage.pushNotification(message);
        });
      } else {
        Chat.publishAdd(item.chat, 'messages', message, req);
        ChatMessage.pushNotification(message);
      }
    });
  },
  findUnread(userid, team, type, chat, fromParam) {
    var query = 'SELECT chat_message.chat, chat_message.type, chat_message.createdAt, chat_message.body, chat_message.id, chat_message.from, chat_user.user, team_user.user, team_user.team FROM chat_message LEFT JOIN chat_user ON chat_message.chat = chat_user.chat LEFT JOIN team_user ON chat_user.user = team_user.id';
    var queryparams = [];
    if (fromParam) {
      query += ' LEFT JOIN team_user as from_user ON from_user.id = chat_message.from '
    }

    query += ' WHERE (chat_user.last_seen < chat_message.createdAt OR chat_user.last_seen IS NULL) AND team_user.user=? AND chat_message.createdAt > chat_user.createdAt';
    queryparams.push(userid);
    if (team) {
      if (Array.isArray(team)) {
        query += ' AND chat_user.team IN ? ';
        queryparams.push([team]);
      } else {
        query += ' AND chat_user.team = ? ';
        queryparams.push(team);
      }
    }
    if (type) {
      if (Array.isArray(type)) {
        query += ' AND chat_user.chatType IN ? ';
        queryparams.push([type]);
      } else {
        query += ' AND chat_user.chatType = ? ';
        queryparams.push(type);
      }
    }
    if (chat) {
      if (Array.isArray(chat)) {
        query += ' AND chat_message.chat IN ? ';
        queryparams.push([chat]);
      } else {
        query += ' AND chat_message.chat = ? ';
        queryparams.push(chat);
      }
    }
    if (fromParam) {
      if (Array.isArray(fromParam)) {
        query += ' AND from_user.user IN () ';
        queryparams.push([fromParam]);
      } else {
        query += ' AND from_user.user = ? ';
        queryparams.push(fromParam);
      }
    }

    query += 'ORDER BY id DESC;';
    return ChatMessage.rawQuery(query, queryparams);
  },
  findLastMessage(chatid) {
    var query = "SELECT createdAt FROM chat_message WHERE chat = ? ORDER BY id DESC LIMIT 1";
    var queryparams = chatid;
    return ChatMessage.rawQuery(query, queryparams);
  },
  translate(options) {
    return new Promise(function(resolve, reject) {
      googleTranslate.translations.list({
        auth: sails.config.google.translate_apiKey,
        q: options.message,
        target: options.targetLang,
        source: options.sourceLang,
        format: "html"
      }, {
        encoding: "utf-8"
      }, function(err, results) {
        if (!err) {
          resolve(results.data.translations[0].translatedText);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  },
  pushNotification(message) {

    /** Get all the team related information */
    return Team.findOne({
        id: message.chat.team
      })
      .then(team => {

        /** Find the associated chat and populate it's users */
        return Chat.findOne({
            id: message.chat.id
          })
          .populate('users')
          .then(chat => {
            if (chat) {
              /** Loop through every user in the chat */
              _.each(chat.users, user => {
                if (user) {
                  /** Create a from object as it was intended */
                  let fromObj = {
                    chat: message.chat,
                    user: message.from,
                    caller_id_name: null,
                    caller_id_number: null
                  };

                  if (fromObj.user && fromObj.user.id === user.id && message.type === 'participant_added') {
                    return TransformerService.chatmessage.send(message).then(chMessage => {
                      let params = {
                        id: fromObj.user.user,
                        createdAt: fromObj.user.createdAt
                      }
                      return UserDevice.sendNotification(user.user, fromObj, team, message.type, chMessage, params);
                    }).catch(console.log);
                  } else if (fromObj.user && fromObj.user.id !== user.id) {

                    if (message.room_mentions.length > 0 && message.from.user === user.user) {
                      return;
                    }

                    if (message.user_mentions.length > 0 && message.user_mentions[0].user === user.user) {
                      return;
                    }

                    return TransformerService.chatmessage.send(message).then(chMessage => {
                      if (chMessage.type === 'file') {
                        chMessage.filename = chMessage.file.filename;
                        chMessage.thumb_url = chMessage.file.thumb_url;
                        delete chMessage.file;
                      }

                      if (chMessage.type === 'text') {
                        let len = chMessage.body.length;

                        if (len > 180) {
                          chMessage.body = chMessage.body.slice(0, 177);
                          chMessage.body = chMessage.body + '...';
                        }
                      }

                      return UserDevice.sendNotification(user.user, fromObj, team, message.type, chMessage);
                    }).catch(console.log);
                  } else if (message.type === 'participant_added' && !fromObj.user) {
                    return TransformerService.chatmessage.send(message).then(chMessage => {

                      return UserDevice.sendNotification(user.user, fromObj, team, message.type, chMessage);
                    }).catch(console.log);
                  }
                }
              });
            }
          });
      });
  },
  getImageSize(key) {
    return requestImageSize(`${sails.config.s3BaseUrl}${key}`)
      .then(size => {
        if (size) {
          let response = {};
          let width = null;
          let height = null;
          let thumbUrl = null;
          let sizeWidth = size && size.width || 1;
          let sizeHeight = size && size.height || 1;

          let scalingFactor = Math.min(
            460 / sizeWidth,
            360 / sizeHeight
          );

          response.width = scalingFactor * sizeWidth;
          response.height = scalingFactor * sizeHeight;
          response.thumbUrl = Files.encodeS3URI(key);

          return response;
        }
      })
      .catch((e) => {
        throw new Error(e)
      });
  }
};

/**
 * @apiDefine message
 *
 * @apiSuccess (message) {User} from
 * @apiSuccess (message) {string} type
 * @apiSuccess (message) {Object} body
 * @apiSuccess (message) {integer} id
 */