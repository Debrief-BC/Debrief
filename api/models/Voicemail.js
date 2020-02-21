'use strict';
/**
 * Voicemail.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

/* jshint node: true */

module.exports = {
  tableName: 'voicemail_msgs',
  attributes: {
    personal_owner: {
      model: 'user'
    },
    group_owner: {
      model: 'chat'
    },
    chat: {
      model: 'chat'
    },
    cid_team: {
      model: 'user',
    },
    cid_pstn: {
      type: 'string',
    },
    cid_name: {
      type: 'string',
    },
    cid_number: {
      type: 'string',
    },
    team: {
      type: 'integer',
    },
    file: {
      model: 'files',
    },
    read_flags: {
      type: 'string',
      enum: ['new', 'saved', 'deleted']
    },
    transcript: {
      type: 'string',
    },
  },
  defaultFilter: ['personal_owner', 'group_owner', 'team', 'read_flags'],
  defaultPopulate: ['personal_owner', 'group_owner', 'team', 'cid_team', 'cid_pstn', 'cid_number', 'file', 'read_flags'],

  afterCreate: function(created, cb) {
    console.log('created', created);

    cb();
    //TODO: new voicemail created, notify user: 1. send MWI to hardphone. 2. add msg in chat
    TeamUser.findOne({
      user: created.personal_owner,
      team: created.team
    }).then(function(teamuser) {
      var notification = {
        type: "voicemail",
        user: teamuser.id,
        team: teamuser.team,
        voicemail: created.id,
        read: false
      }
      Notifications.createAndPublish(notification);
      TeamUser.findOne({
        user: created.cid_team,
        team: created.team
      }).then(function(from) {
        var chatMessage = {
          from: from.id,
          type: "voicemail",
          chat: created.chat,
          file: created.file
        }
        ChatMessage.createAndPublish(chatMessage);
      });
    });


    // Send a PSTN voicemail if necessary
    if (created.cid_pstn) {
      let fromObj = {
        caller_id_name: "",
        caller_id_number: created.cid_pstn
      };

      let messageObj = {
        body: 'You have a new voicemail'
      };

      return UserDevice.sendNotification(created.personal_owner, fromObj, created.team, 'voicemail', messageObj);
    }

    /** Find the individual chat  */
    return Chat
      .findOne({
        id: created.chat
      })
      .populate('team')
      .populate('users')
      .then((chat) => {

        return TeamUser
          .findOne({
            user: created.cid_team
          }).then(teamUser => {
            if (chat.users) {
              _.each(chat.users, (chatUser) => {

                let fromObj = {};
                let messageObj = {};

                if (chatUser.id !== teamUser.id) {

                  fromObj.chat = Chat.idToPidSync(chat.id);
                  fromObj.user = TeamUser.idToPidSync(teamUser.id);
                  fromObj.caller_id_name = null;
                  fromObj.caller_id_number - null;

                  messageObj.body = 'You have a new voicemail';

                  return UserDevice.sendNotification(chatUser.user, fromObj, chat.team, 'voicemail', messageObj);
                }
              });
            }
          });

      }).catch(console.log);
  },
  afterUpdate: function(updated, cb) {
    cb();
    // TODO: voicemmail was read, notify user
  },
  afterDestroy: function(deleted, cb) {
    cb();
    // TODO: update MWI, and chat msg also???
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