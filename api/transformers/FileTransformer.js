'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {

    return Transformer.build(data, {
      'user': {
        key: 'user',
        value: function(user) {
          if (user) {
            user = user.id ? user.id : user
            return TeamUser.findOne(user).then(function(user) {
              return TransformerService.teamuser.send(user);
            });
          } else {
            return null;
          }
        }
      },
      'chat': {
        key: 'chat',
        value: function(chat) {
          if (chat) {
            chat = chat.id ? chat.id : chat
            return Chat.find(chat).populate('users').then(function(chat) {
              return TransformerService.chat.send(chat[0]);
            });
          } else {
            return null;
          }

        }
      },
      //'user':{key: 'user', value: TransformerService.user.sendUserOrPid},
      //'chat':{key: 'chat', value: TransformerService.chat.sendChatOrPid},
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'name': {
        key: 'name',
        value: function(name) {
          return unescape(name);
        }
      },
      'filename': {
        key: 'filename',
        value: function(name) {
          return unescape(name);
        }
      },
      'extension': {
        key: 'extension'
      },
      'id': {
        key: 'id',
        value: Files.idToPid
      },
      'size': {
        key: 'size'
      },
      'thumbWidth': {
        key: 'thumbWidth',
        value: (thumbWidth, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g thumbWidth needs to be thumb_width.
           *
           * This needs to be removed in v2.3
           */

          if (thumbWidth) {
            newObj.thumb_width = thumbWidth;
          }

          return thumbWidth;

        }
      },
      'thumbHeight': {
        key: 'thumbHeight',
        value: (thumbHeight, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g thumbHeight needs to be thumb_height.
           *
           * This needs to be removed in v2.3
           */

          if (thumbHeight) {
            newObj.thumb_height = thumbHeight
          }

          return thumbHeight;
        }
      },
      'createdAt': {
        key: 'createdAt',
        value: (createdAt, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g createAt needs to be created_at.
           *
           * This needs to be removed in v2.3
           */
          if (createdAt) {
            newObj.created_at = createdAt;
          }

          return createdAt;
        }
      },
      'teamuser': {
        key: 'teamuser',
        value: TransformerService.teamuser.send
      },
      'routing_audio': 'routing_audio',
      'url': {
        key: 'url'
      },
      'thumb_url': {
        key: 'thumb_url'
      }
    });
  },

  get: function(req) {
    return Transformer.buildGet(req, {
      'user': {
        key: 'user',
        value: User.pidToId
      },
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'name': {
        key: 'name'
      },
      'filename': {
        key: 'filename'
      },
      'extension': {
        key: 'extension'
      },
      'id': {
        key: 'id',
        value: Files.pidToId
      },
      'size': {
        key: 'size'
      },
      'thumbWidth': {
        key: 'thumbWidth',
        value: (thumbWidth, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g thumbWidth needs to be thumb_width.
           *
           * This needs to be removed in v2.3
           */

          if (thumbWidth) {
            newObj.thumb_width = thumbWidth;
          }

          return thumbWidth;

        }
      },
      'thumbHeight': {
        key: 'thumbHeight',
        value: (thumbHeight, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g thumbHeight needs to be thumb_height.
           *
           * This needs to be removed in v2.3
           */

          if (thumbHeight) {
            newObj.thumb_height = thumbHeight
          }

          return thumbHeight;
        }
      },
      'routing_audio': 'routing_audio',
      'url': {
        key: 'url'
      },
      'thumb_url': {
        key: 'thumb_url'
      }
    });
  },
  sendSliced: function(data) {

    var sliced = data.reverse().slice(0, 5);

    return TransformerService.files.send(sliced);
  },

  getLinksAndFiles: function(req) {
    return Transformer.buildGet(req, {
      'linkid': {
        key: 'linkid'
      },
      'fileid': {
        key: 'fileid'
      },
      'title': {
        key: 'title'
      },
      'filename': {
        key: 'filename'
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'user': {
        key: 'user',
        value: User.pidToId
      },
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'name': {
        name: 'name'
      },
      'extension': {
        key: 'extension'
      },
      'link': {
        key: 'link'
      },
      'image': {
        key: 'image'
      },
      'description': {
        key: 'description'
      },
      'createdAt': {
        key: 'createdAt',
        value: (createdAt, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g createAt needs to be created_at.
           *
           * This needs to be removed in v2.3
           */
          if (createdAt) {
            newObj.created_at = createdAt;
          }

          return createdAt;
        }
      }
    });
  },

  sendLinksAndFiles: function(data) {

    return Transformer.build(data, {
      'linkid': {
        key: 'linkid',
        value: Links.idToPid
      },
      'fileid': {
        key: 'fileid',
        value: Files.idToPid
      },
      'title': {
        key: 'title'
      },
      'filename': {
        key: 'filename'
      },
      'user': {
        key: 'user',
        value: function(user) {

          return User.find(user).then(function(response) {
            return TransformerService.teamuser.send(response);
          });

        }
      },
      'chat': {
        key: 'chat',
        value: function(chat) {

          return Chat.find(chat).then(function(chat) {
            return TransformerService.chat.send(chat);
          });

        }
      },
      'name': {
        key: 'name'
      },
      'extension': {
        key: 'extension'
      },
      'link': {
        key: 'link'
      },
      'image': {
        key: 'image'
      },
      'description': {
        key: 'description'
      },
      'createdAt': {
        key: 'createdAt',
        value: (createdAt, newObj) => {
          /**
           * @deprecated
           * We need to create camelCase for snake_case
           * e.g createAt needs to be created_at.
           *
           * This needs to be removed in v2.3
           */
          if (createdAt) {
            newObj.created_at = createdAt;
          }

          return createdAt;
        }
      },
      'teamuser': {
        key: 'teamuser',
        value: TransformerService.teamuser.send
      },
      'url': {
        key: 'url'
      },
      'thumb_url': {
        key: 'thumb_url'
      }
    });
  },
  sendFileOrPid: (data) => {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.files.send(data);
    } else {
      return Files.idToPid(data);
    }
  },

};