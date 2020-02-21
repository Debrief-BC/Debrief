'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'chatid': {
        key: 'chatid',
        value: Chat.pidToId
      },
      'user': {
        key: 'user',
        value: User.pidToId
      },
      'userid': {
        key: 'userid',
        value: User.pidToId
      },
      'favorite': {
        key: 'favorite'
      },
      'do_not_disturb': 'do_not_disturb',
      'last_seen': {
        key: 'last_seen'
      },
      'blocked': 'blocked'
    });
  },

  send: function(chatUsers) {
    return Transformer.build(chatUsers, {
      'user': {
        key: 'user',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'last_seen': {
        key: 'last_seen'
      },
      'favorite': {
        key: 'favorite'
      },
      'do_not_disturb': 'do_not_disturb',
      'blocked': 'blocked',
      'chat': {
        key: 'chat',
        value: TransformerService.chat.sendChatOrPid
      },
      'id': {
        key: 'id',
        value: ChatUser.idToPid
      }
    });
  }
};