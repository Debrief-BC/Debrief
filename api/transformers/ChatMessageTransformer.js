'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(message) {

    var message_type;
    if (message) {
      if (Array.isArray(message)) {
        message.forEach(function(chatmessage) {
          chatmessage.language = chatmessage.language || '';
        })
      } else {
        message.language = message.language || '';
      }
    }

    return Transformer.build(message, {
      'id': {
        key: 'id',
        value: ChatMessage.idToPid
      },
      'type': {
        key: 'type',
        value: function(type) {
          message_type = type;
          return message_type;
        }
      },
      'body': {
        key: 'body',
        value: function(body) {

          if (message_type == 'call_log') {

            return Transformer.build(body, {
              'from': {
                key: 'from',
                value: function(from) {
                  if (from && !from.id) {
                    return TeamUser.findOne({
                      id: from
                    }).then(function(fromUser) {
                      return TransformerService.teamuser.sendUserOrPid(fromUser);
                    });
                  } else {
                    return TransformerService.teamuser.sendUserOrPid(from);
                  }
                }
              },
              'to': {
                key: 'to',
                value: function(to) {
                  if (to && !to.id) {
                    return TeamUser.findOne({
                      id: to
                    }).then(function(toUser) {
                      return TransformerService.teamuser.sendUserOrPid(toUser);
                    });
                  } else {
                    return TransformerService.teamuser.sendUserOrPid(to);
                  }
                }
              },
              'type': 'type',
              'pstn': 'pstn',
              'duration': 'duration'
            });

          } else if (message_type == 'participant_added' || message_type == 'participant_removed' || message_type == 'participant_joined' || message_type == 'participant_left') {
            if (Array.isArray(body) && body[0] == undefined) {
              return '';
            } else {
              return TransformerService.teamuser.sendUserOrPid(body);
            }
          } else if (message_type == 'file') {
            return '';
          }

          if (typeof body === 'string') {
            if (body.indexOf('"') > -1) {
              body = body.replace(/^"(.*)"$/, '$1');
            }
          }

          return body;
        }
      },
      'createdAt': {
        key: 'created_at'
      },
      'file': {
        key: 'file',
        value: TransformerService.files.sendFileOrPid
      },
      'links': {
        key: 'links',
        value: TransformerService.links.send
      },
      'from': {
        key: 'from',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'chat': {
        key: 'chat',
        value: TransformerService.chat.sendChatOrPid
      },
      'user_mentions': {
        key: 'user_mentions',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'room_mentions': {
        key: 'room_mentions',
        value: TransformerService.chat.sendChatOrPid
      },
      'translated': 'translated',
      'language': {
        key: 'language',
        value: function(language, srcObj, retObj) {
          if (language) {
            return language;
          } else {
            if (retObj.from && typeof retObj.from !== 'object') {
              return TeamUser.findOne({
                id: retObj.from
              }).then(function(teamuser) {
                if (teamuser) {
                  return User.findOne({
                    id: teamuser.user
                  }).then(function(user) {
                    if (user) {
                      return user.language;
                    } else {
                      return;
                    }
                  });
                }
              });
            } else if (retObj.from && retObj.from.user) {
              return User.findOne({
                id: retObj.from.user
              }).then(function(user) {
                return user.language;
              });
            } else {
              return;
            }
          }
        }
      },
    });
  },

  get: function(req) {
    return Transformer.buildGet(req, {
      'messageid': {
        key: 'messageid',
        value: ChatMessage.pidToId
      },
      'chatid': {
        key: 'chatid',
        value: Chat.pidToId
      },
      'type': {
        key: 'type'
      },
      'body': {
        key: 'body',
        value: function(body) {
          if (typeof body !== 'object') {
            body = escape(body);
            body = JSON.stringify(body);

            return body;
          }

          if (body.from) {
            try {
              body.from = User.pidToIdSync(body.from)
            } catch (e) {}
          }

          if (body.to) {
            try {
              body.to = User.pidToIdSync(body.to)
            } catch (e) {}
          }

          return body;

        }
      },
      'created_at': {
        key: 'createdAt'
      },
      'from': {
        key: 'from',
        value: User.pidToId
      }
    });
  },
  editGet: function(req) {
    return Transformer.buildGet(req, {
      'messageid': {
        key: 'messageid',
        value: ChatMessage.pidToId
      },
      'chatid': {
        key: 'chatid',
        value: Chat.pidToId
      },
      'type': {
        key: 'type'
      },
      'body': {
        key: 'body',
        value: function(body) {
          if (typeof body !== 'object') {

            body = escape(body);

            if (typeof body === 'string') {
              return body
            } else {
              return JSON.stringify(body);
            }
          }
          if (body.from) {
            try {
              body.from = User.pidToIdSync(body.from)
            } catch (e) {}
          }

          if (body.to) {
            try {
              body.to = User.pidToIdSync(body.to)
            } catch (e) {}
          }

        }
      },
      'created_at': {
        key: 'createdAt'
      }
    });
  },
  getunread: function(req) {
    return Transformer.buildGet(req, {
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'type': {
        key: 'type'
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'from': {
        key: 'from',
        value: User.pidToId
      }
    });
  }
}