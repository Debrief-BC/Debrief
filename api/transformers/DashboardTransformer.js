'use strict';

var Transformer = require('./Transformer');

module.exports = {
  getMain: function(req) {
    return Transformer.buildGet(req, {
      'include': 'include',
      'team': {
        'key': 'team',
        'value': Team.pidToId
      }
    });
  },
  getNotification: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        'key': 'id',
        'value': Notifications.pidToId
      }
    });
  },
  sendNotification: function(req) {
    return Transformer.build(req, {
      'id': {
        key: 'id',
        value: Notifications.idToPid
      },
      'type': {
        key: 'type'
      },
      'user': {
        key: 'user',
        value: TeamUser.idToPid
      },
      'team': {
        key: 'team',
        value: Team.idToPid
      },
      'file': {
        key: 'file',
        value: Files.idToPid
      },
      'link': {
        key: 'link',
        value: Links.idToPid
      },
      'voicemail': {
        key: 'voicemail',
        value: Voicemail.idToPid
      },
      'call_log': {
        key: 'call_log',
        value: CallLog.idToPid
      },
      'message': {
        key: 'message',
        value: ChatMessage.idToPid
      },
      'user_mentrion': {
        key: 'user_mentrion',
        value: UserMention.idToPid
      },
      'new_user': {
        key: 'new_user',
        value: TeamUser.idToPid
      },
      'read': 'read'
    });
  },
  sendMain: function(data) {
    var promises = [];
    data.forEach(function(result) {
      var item = result.tbl;
      item.chat = result.chat;
      item.user = result.team_user;
      if (typeof item.body == 'string') {
        item.body = JSON.parse(item.body);
      }

      var promise = item;
      switch (item.type) {
        case 'file':
          promise = TransformerService.files.send(item).then(function(res) {
            res.type = 'file';
            return res;
          });
          break;
        case 'link':
          item.user = item.user.id;
          promise = TransformerService.links.send(item).then(function(res) {
            res.type = 'link';
            return res;
          });
          break;
        case 'participant_added':
          item.from = item.user;
          promise = TeamUser.find({
            id: item.body
          }).then(function(users) {
            item.body = users;
            return TransformerService.chatmessage.send(item);
          });
          break;
        case 'participant_left':
        case 'participant_removed':
          item.from = item.user;
          promise = TeamUser.find({
            id: item.body
          }).then(function(users) {
            item.body = users;
            return TransformerService.chatmessage.send(item);
          });
          break;
        case 'chat_avatar':
          promise = Files.findOne({
            id: item.filename
          }).populate("chat").then(function(file) {
            file.user = item.user;
            return TransformerService.files.send(file).then(function(res) {
              res.type = 'chat_avatar';
              return res;
            });
          });
          break;
      }
      promises.push(promise);
    });

    return Promise.all(promises);
  },
  sendNotifications: function(data) {
    var promises = [];
    data.forEach(function(result) {
      var item = result.tbl;
      item.chat = result.chat;
      item.user = result.team_user;
      if (typeof item.body == 'string') {
        var str = item.body;
        try {
          item.body = JSON.parse(str);
        } catch (e) {
          item.body = str;
        }
      }

      var promise = item;
      switch (item.notification_type) {
        case 'message':
          item.from = item.user;
          promise = TransformerService.chatmessage.send(item).then(function(res) {
            res.notification_type = item.notification_type;
            return res;
          });
          break;
        case 'call_log':
          item.other_user = item.user;
          item.other_chat = item.chat;
          promise = TransformerService.calllog.send(item).then(function(res) {
            res.notification_type = item.notification_type;
            return res;
          });
          break;
      }
      promises.push(promise);
    });

    return Promise.all(promises);
  },

  sendTimeline: function(data) {
    var promises = [];
    data.forEach(function(item) {
      var promise = item;
      switch (item.type) {
        case 'file':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.files.send(item.file).then(function(res) {
              res.type = 'file';
              res.read = item.read;
              res.notificationId = item.id;
              return res;
            });
          });
          break;
        case 'link':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.links.send(item.link).then(function(res) {
              res.type = 'link';
              res.read = item.read;
              res.notificationId = item.id;
              return res;
            });
          });
          break;
        case 'participant_added':
        case 'participant_left':
        case 'participant_removed':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.message.id
            }).populate('chat').populate('from').then(function(message) {
              return TeamUser.find({
                user: message.body,
                team: message.chat.team
              }).then(function(users) {
                message.body = users;
                return TransformerService.chatmessage.send(message).then(function(res) {
                  res.read = item.read;
                  res.notificationId = item.id;
                  return res;
                });
              });
            });
          });
          break;
        case 'chat_locked':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.message.id
            }).populate('chat').populate('from').then(function(message) {
              return TransformerService.chatmessage.send(message).then(function(res) {
                res.type = 'chat_locked';
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              });
            });
          });
          break;
        case 'chat_avatar':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.message.id
            }).populate('from').populate('chat').populate('file').then(function(message) {
              return TransformerService.chatmessage.send(message).then(function(res) {
                res.type = 'chat_avatar';
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              });
            });
          });
          break;
        case 'at_mention':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.user_mention.message
            }).populate('from').populate('chat').then(function(message) {
              return TransformerService.chatmessage.send(message).then(function(res) {
                res.type = "at_mention";
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              })
            });
          });
          break;
        case 'missed_incoming':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return CallLog.findOne({
              id: item.call_log.id
            }).populate('other_chat').populate('other_user').populate('owner').then(function(call_log) {
              return TransformerService.calllog.send(call_log).then(function(res) {
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              });
            });
          });
          break;
        case 'voicemail':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return Voicemail.findOne({
              id: item.voicemail.id
            }).populate('cid_team').populate('chat').then(function(voicemail) {
              return TransformerService.voicemail.notificationResponse(voicemail).then(function(res) {
                res.type = 'voicemail';
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              })
            });
          });
          break;
        case 'chat_added':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.chat.send(item.chat).then(function(res) {
              var response = {
                chat: res
              };
              response.type = 'chat_added';
              response.read = item.read;
              response.notificationId = item.id;
              return response;
            });
          });
          break;
        case 'user_added':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.teamuser.send(item.new_user).then(function(res) {
              var response = {
                new_user: res
              };
              response.type = 'user_added';
              response.read = item.read;
              response.notificationId = item.id;
              return response;
            });
          });
          break;
        case 'event':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.teamuser.send(item.event_owner).then(function(res) {
              var response = {
                event_owner: res
              };
              response.type = 'event';
              response.created_at = item.createdAt;
              response.read = item.read;
              response.notificationId = item.id;
              return response;
            });
          });
          break;


      }
      promises.push(promise);
    });

    return Promise.all(promises);
  },

  sendNotifications: function(data) {
    var promises = [];
    data.forEach(function(item) {
      var promise = item;
      switch (item.type) {
        case 'file':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.files.send(item.file).then(function(res) {
              res.type = 'file';
              res.read = item.read;
              res.notificationId = item.id;
              return res;
            });
          });
          break;
        case 'link':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.links.send(item.link).then(function(res) {
              res.type = 'link';
              res.read = item.read;
              res.notificationId = item.id;
              return res;
            });
          });
          break;
        case 'participant_added':
        case 'participant_left':
        case 'participant_removed':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.message.id
            }).populate('chat').populate('from').then(function(message) {
              return TeamUser.find({
                user: message.body,
                team: message.chat.team
              }).then(function(users) {
                message.body = users;
                return TransformerService.chatmessage.send(message).then(function(res) {
                  res.read = item.read;
                  res.from = res.body;
                  res.notificationId = item.id;
                  return res;
                });
              });
            });
          });
          break;
        case 'chat_locked':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.message.id
            }).populate('chat').populate('from').then(function(message) {
              return TransformerService.chatmessage.send(message).then(function(res) {
                res.type = 'chat_locked';
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              });
            });
          });
          break;
        case 'chat_avatar':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.message.id
            }).populate('from').populate('chat').populate('file').then(function(message) {
              return TransformerService.chatmessage.send(message).then(function(res) {
                res.type = 'chat_avatar';
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              });
            });
          });
          break;
        case 'at_mention':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return ChatMessage.findOne({
              id: item.user_mention.message
            }).populate('from').populate('chat').then(function(message) {
              return TransformerService.chatmessage.send(message).then(function(res) {
                res.type = "at_mention";
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              })
            });
          });
          break;
        case 'missed_incoming':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return CallLog.findOne({
              id: item.call_log.id
            }).populate('other_chat').populate('other_user').populate('owner').then(function(call_log) {
              return TransformerService.calllog.send(call_log).then(function(res) {
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              });
            });
          });
          break;
        case 'voicemail':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return Voicemail.findOne({
              id: item.voicemail.id
            }).populate('cid_team').populate('chat').then(function(voicemail) {
              return TransformerService.voicemail.notificationResponse(voicemail).then(function(res) {
                res.type = 'voicemail';
                res.read = item.read;
                res.notificationId = item.id;
                return res;
              })
            });
          });
          break;
        case 'chat_added':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.chat.send(item.chat).then(function(res) {
              var response = {
                chat: res
              };
              response.type = 'chat_added';
              response.read = item.read;
              response.notificationId = item.id;
              return response;
            });
          });
          break;
        case 'user_added':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.teamuser.send(item.new_user).then(function(res) {
              var response = {
                new_user: res
              };
              response.type = 'user_added';
              response.read = item.read;
              response.notificationId = item.id;
              return response;
            });
          });
          break;
        case 'event':
          promise = Notifications.idToPid(item.id).then(function(id) {
            item.id = id;
            return TransformerService.teamuser.send(item.event_owner).then(function(res) {
              var response = {
                event_owner: res
              };
              response.type = 'event';
              response.created_at = item.createdAt;
              response.read = item.read;
              response.notificationId = item.id;
              return response;
            });
          });
          break;


      }
      promises.push(promise);
    });

    return Promise.all(promises).then(function(notifications) {
      if (data.length > 0) {
        return Notifications.getUnreadCount(data[0].user).then(function(count) {
          var response = {
            notifications: notifications,
            unread: count
          }
          return response;
        })
      } else {
        var response = {
          notifications: null,
          unread: 0
        }
        return response;
      }
    })
  }
}