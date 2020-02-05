'use strict';

module.exports = {
  tableName: 'call_log',
  attributes: {
    type: {
      type: 'string' // incoming, outgoing, missed_outgoing, missed_incoming
    },
    owner: {
      model: 'teamuser'
    },
    other_user: {
      model: 'teamuser'
    },
    other_caller_id_name: {
      type: 'string'
    },
    other_caller_id_number: {
      type: 'string'
    },
    other_chat: {
      model: 'chat'
    },
    team: {
      model: 'team'
    },
    duration: {
      type: 'integer'
    },
    time: {
      type: 'datetime',
      defaultsTo: function() {
        return new Date().toISOString();
      }
    }
  },
  defaultFilter: ['owner', 'other_user', 'other_caller_id_name', 'other_caller_id_number', 'team', 'time'],
  defaultPopulate: ['team', 'owner', 'other_user', 'other_chat'],
  afterCreate: function(created, cb) {
    cb();
    if (created.type === "missed_incoming") {
      var notifications = [];
      TeamUser.findOne({
        id: created.owner
      }).then(function(teamuser) {
        var notification = {
          type: created.type,
          user: teamuser.id,
          team: teamuser.team,
          call_log: created.id,
          read: false
        }
        Notifications.createAndPublish(notification);
      })
    }
  },
  processCid: function(cid) {
    var rtn = {};
    if (cid.user) {
      rtn.other_user = cid.user;
    } else if (cid.chat) {
      rtn.other_chat = cid.chat;
    } else {
      rtn.other_caller_id_name = cid.caller_id_name;
      rtn.other_caller_id_number = cid.caller_id_number;
    }
    return rtn;
  },
  createLog: function(type, owner, team, duration, other_cid) {
    var calllog = {
      type: type,
      owner: owner,
      team: team,
      duration: duration,
      other_user: other_cid.user || null,
      other_chat: other_cid.chat || null,
      other_caller_id_name: other_cid.other_caller_name || null,
      other_caller_id_number: other_cid.other_caller_id_number || null
    };

    return CallLog.create(calllog);
  },
  createChatMessage: function(type, from_user, to_user, duration, team) {
    var privChat = {
      type: 'private',
      team: team,
      users: [from_user.user, to_user.user]
    }
    return Chat.createChat(privChat).then(function(chat) {
      var msg = {
        type: 'call_log',
        body: {
          from: from_user.user,
          to: to_user.user,
          type: type,
          duration: duration
        },
        from: from_user.id,
        chat: chat.id
      };
      return ChatMessage.createAndPublish(msg);
    });
  }
};