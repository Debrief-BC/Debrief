module.exports = {
  tableName: 'user_mention',
  attributes: {
    user: {
      model: 'teamuser'
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

    let gblTeamUser = null;

    TeamUser.findOne({
      id: created.user
    }).then(function(teamuser) {
      gblTeamUser = teamuser;
      Chat.findOne({
          id: created.chat
        }).populate('users').then(chat => {
          if (chat) {
            let userIds = _.pluck(chat.users, 'id');

            if (userIds.indexOf(parseInt(created.user)) !== -1) {
              let notification = {
                type: "at_mention",
                user: teamuser.id,
                team: teamuser.team,
                user_mention: created.id,
                read: false
              }

              Notifications.createAndPublish(notification);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    });


    /** Find the related chat message */
    ChatMessage.findOne({
      id: created.message
    }).populate('from').populate('chat').then(function(chatMessage) {

      /** Find the individual chat that's associated with this message */
      Chat.findOne({
        id: chatMessage.chat.id
      }).populate('users').then(function(chat) {

        /** Find the team that's associated with this chat */
        Team.findOne({
          id: chat.team
        }).then(function(team) {

          var fromObj = {};
          fromObj.chat = chatMessage.chat;
          fromObj.user = chatMessage.from;
          fromObj.caller_id_name = null;
          fromObj.caller_id_number = null;

          /** Only notify the user if the are in the chat,
           *  and was mentioned in the same chat
           */
          _.each(chat.users, function(user) {
            // only send notification if the person is mentioned in a group
            if (user.id === created.user && chat.type == 'room') {

              TransformerService.chatmessage.send(chatMessage).then((tfChatMessage) => {
                let params = {
                  id: gblTeamUser.user,
                  firstname: gblTeamUser.firstname,
                  lastname: gblTeamUser.lastname,
                  extension: gblTeamUser.extension
                }

                return UserDevice.sendNotification(user.user, fromObj, team, 'user_mention', tfChatMessage, params);
              });
            }
          });

        });

      });
    });
  },
}