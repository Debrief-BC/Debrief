'use strict';

module.exports = {
  attributes: {
    type: {
      type: 'string',
    },
    user: {
      model: 'teamuser'
    },
    team: {
      model: 'team'
    },
    file: {
      model: 'files'
    },
    link: {
      model: 'links'
    },
    voicemail: {
      model: 'voicemail'
    },
    call_log: {
      model: 'calllog'
    },
    message: {
      model: 'chatmessage'
    },
    user_mention: {
      model: 'usermention'
    },
    read: {
      type: 'boolean',
    },
    new_user: {
      model: 'teamuser'
    },
    event_owner: {
      model: 'teamuser'
    },
    chat: {
      model: 'chat'
    },
    deletedAt: {
      type: 'date'
    },
  },
  defaultPopulate: ['user', 'file', 'link', 'voicemail', 'call_log', 'message', 'user_mention', 'new_user'],

  getUnreadCount: function(teamUserId) {
    return Notifications.find({
      user: teamUserId,
      read: 0,
      type: ['participant_added', 'user_added', 'chat_added', 'missed_incoming', 'at_mention', 'voicemail', 'event']
    }).then(function(notifications) {
      return notifications.length;
    })
  },
  publishCreateOverride: function(items, req) {
    var events = ['participant_added', 'user_added', 'chat_added', 'missed_incoming', 'at_mention', 'voicemail', 'event'];

    var findNoitifications = function() {
      if (Array.isArray(items)) {
        var promises = [];
        items.forEach(function(notification) {
          if (_.contains(events, notification.type)) {
            var promise = Notifications.findOne({
                id: notification.id
              })
              .populate('voicemail')
              .populate('call_log')
              .populate('message')
              .populate('user_mention')
              .populate('new_user')
              .populate('event_owner')
              .populate('chat')
              .then(function(result) {
                return TransformerService.dashboard.sendNotifications([result]).then(function(item) {
                  return getUser(notification.user).then(function(user) {
                    return publishNotification({
                      user: user,
                      item: item.notifications[0]
                    })
                  })
                })
              })
            promises.push(promise);
          }
        })
        return Promise.all(promises);


      } else {
        if (_.contains(events, items.type)) {
          return Notifications.findOne({
              id: items.id
            })
            .populate('voicemail')
            .populate('call_log')
            .populate('message')
            .populate('user_mention')
            .populate('new_user')
            .populate('event_owner')
            .populate('chat')
            .then(function(result) {
              return TransformerService.dashboard.sendNotifications([result]).then(function(item) {
                return getUser(items.user).then(function(user) {
                  return publishNotification({
                    user: user,
                    item: item.notifications[0]
                  })
                });
              });
            });
        }
      }
    }

    var getUser = function(id) {
      return TeamUser.findOne({
        id: id
      }).then(function(teamuser) {
        return User.idToPid(teamuser.user);
      })
    };

    var publishNotification = function(opts) {
      return User.publish(opts.user, 'user', 'add:notifications', {
        added: opts.item,
        addedId: opts.item.id,
        attribute: 'notifications',
        id: opts.user,
        verb: 'addedTo'
      });
    };

    return findNoitifications();

  },
};