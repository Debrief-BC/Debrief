'use strict';

module.exports = {
  attributes: {
    link: {
      type: 'string'
    },
    image: {
      type: 'text'
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'text'
    },
    user: {
      model: 'teamuser'
    },
    chat: {
      model: 'chat'
    }
  },
  afterCreate: function(created, cb) {
    cb();
    Search.create({
        name: created.title,
        user: created.user,
        link: created.link
      },
      created.id,
      'links',
      created.chat);
    ChatUser.find({
      chat: created.chat
    }).then(function(chatusers) {
      var notifications = [];
      chatusers.forEach(function(chatuser) {

        var notification = {
          type: 'link',
          user: chatuser.user,
          team: chatuser.team,
          link: created.id,
          chat: created.chat,
          read: false
        }
        notifications.push(notification);
      })
      Notifications.createAndPublish(notifications)
    })
  },
};