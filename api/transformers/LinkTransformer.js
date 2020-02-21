'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {

    return Transformer.build(data, {
      'user': {
        key: 'user',
        value: function(user) {
          user = user.id ? user.id : user
          return TeamUser.findOne(user).then(function(user) {
            return TransformerService.teamuser.send(user);
          });

        }
      },
      'chat': {
        key: 'chat',
        value: function(chat) {
          chat = chat.id ? chat.id : chat
          return Chat.find(chat).populate('users').then(function(chat) {
            return TransformerService.chat.send(chat[0]);
          });

        }
      },
      //'user':{key: 'user', value: TransformerService.user.sendUserOrPid},
      //'chat':{key: 'chat', value: TransformerService.chat.sendChatOrPid},
      'link': {
        key: 'link'
      },
      'title': {
        key: 'title'
      },
      'link': {
        key: 'link'
      },
      'description': {
        key: 'description'
      },
      'id': {
        key: 'id',
        value: Links.idToPid
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
      'link': {
        key: 'link'
      },
      'title': {
        key: 'title'
      },
      'description': {
        key: 'description'
      },
      'id': {
        key: 'id',
        value: Links.pidToId
      }
    });

  },
  sendSliced: function(data) {

    var sliced = data.reverse().slice(0, 5);

    return Transformer.build(sliced, {
      'user': {
        key: 'user',
        value: function(user) {

          return User.find(user).then(function(response) {
            return TransformerService.teamuser.send(response);
          });

        }
      },
      //'user':{key: 'user', value: TransformerService.user.sendUserOrPid},
      'chat': {
        key: 'chat',
        value: TransformerService.chat.sendChatOrPid
      },
      'link': {
        key: 'link'
      },
      'title': {
        key: 'title'
      },
      'link': {
        key: 'link'
      },
      'description': {
        key: 'description'
      },
      'id': {
        key: 'id',
        value: Links.idToPid
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

  }
};