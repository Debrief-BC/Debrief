'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(calllog) {
    return Transformer.build(calllog, {
      'id': {
        key: 'id',
        value: CallLog.idToPid
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'owner': {
        key: 'owner',
        value: function(owner) {
          if (owner) return TransformerService.teamuser.sendUserOrPid(owner);
        }
      },
      'other_user': {
        key: 'other_user',
        value: function(other_user) {
          if (other_user) return TransformerService.teamuser.sendUserOrPid((other_user));
        }
      },
      'other_caller_id_name': 'other_caller_id_name',
      'other_caller_id_number': 'other_caller_id_number',
      'other_chat': {
        key: 'other_chat',
        value: function(chat) {
          if (chat) return TransformerService.chat.sendChatOrPid(chat);
        }
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'duration': 'duration',
      'time': 'time',
      'type': 'type',
      'createdAt': {
        key: 'created_at'
      },
    });
  },

  sendCallLogOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.calllog.send(data);
    } else {
      return CallLog.idToPid(data);
    }
  },

  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: CallLog.pidToId
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'slug': {
        key: 'slug'
      },
      'from': {
        key: 'from',
        value: TransformerService.calllog.getCid
      },
      'to': {
        key: 'to',
        value: TransformerService.calllog.getCid
      },
      'duration': 'duration',
      'owner': {
        key: 'owner',
        value: User.pidToId
      },
      'other_user': {
        key: 'other_user',
        value: User.pidToId
      },
      'other_chat': {
        key: 'other_chat',
        value: Chat.pidToId
      },
      'other_caller_id_name': 'other_caller_id_name',
      'other_caller_id_number': 'other_caller_id_number',
      'type': 'type',
      'direction': 'direction',
      'populate_participants': 'populate_participants'
    });
  },

  getCid: function(cid) {
    if (cid.user) {
      return User.pidToId(cid.user).then(function(uid) {
        cid.user = uid;
        return cid;
      });
    }
    if (cid.chat) {
      return Chat.pidToId(cid.chat).then(function(chat) {
        cid.chat = chat;
        return cid;
      });
    }
    return cid;
  }
};