'use strict';

module.exports = {
  tableName: 'room_mention',
  attributes: {
    room: {
      model: 'chat'
    },
    message: {
      model: 'chatmessage'
    },
    chat: {
      model: 'chat'
    },
    team: {
      model: 'team'
    }
  },
  afterCreate: function(created, cb) {
    cb();

    Chat.findOne({
      id: created.room
    }).populate('users').then(function(chat) {
      _.each(chat.user, function(user) {
        TeamUser.findOne({
          id: created.user
        }).then(function(teamuser) {
          var notification = {
            type: "at_mention",
            user: teamuser.id,
            team: teamuser.team,
            user_mention: created.id,
            read: false
          }

          Notifications.createAndPublish(notification);
        });
      })
    });

    /** Find the individual chat that's mentioned with this message */
    Chat
      .findOne({
        id: created.chat
      })
      .populate('users')
      .then(function(chat) {

        /** Find the team that's associated with this chat */
        Team.findOne({
          id: chat.team
        }).then(function(team) {

          if (chat.type !== 'private') {
            _.each(chat.users, function(user) {

              var fromObj = {};
              var messageObj = {};

              fromObj.user = user;
              fromObj.chat = chat;
              fromObj.caller_id_name = null;
              fromObj.caller_id_number - null;

              ChatMessage.findOne({
                id: created.message
              }).populate('from').then((message) => {
                Chat.findOne({
                  id: created.room
                }).populate('users').then((mentionedRoom) => {

                  _.each(mentionedRoom.users, (mentionedUser) => {
                    if (mentionedUser.user === user.user) {
                      return TransformerService.chatmessage.send(message).then((tfChatMessage) => {
                        return UserDevice.sendNotification(user.user, fromObj, team, 'room_mention', tfChatMessage);
                      });
                    }
                  })


                }).catch((err) => {
                  sails.log.error('err', err)
                })
              }).catch((err) => {
                sails.log.error('chatmessage err', err);
              });
            });
          }
        });
      });
  },
}