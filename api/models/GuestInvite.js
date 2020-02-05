'use strict';

module.exports = {
  tableName: 'guest',
  attributes: {
    email: {
      type: 'string',
      required: true
    },
    chat: {
      model: 'chat'
    },
    user: {
      model: 'user'
    },
    blocked: {
      type: 'boolean'
    },
    deletedAt: {
      type: 'datetime'
    }
  },
  sendEmail: function(opts, email, invitee) {
    sails.hooks.email.send('GuestInvite', {
      link: sails.config.chatGuestUrl.replace(':teamslug', opts.team.slug).replace(':chaturl', encodeURIComponent(opts.chat.url)).replace(':pin', opts.pin).replace(':chatname', encodeURIComponent(opts.chat.name)),
      invitee: invitee.firstname + " " + invitee.lastname,
      group: opts.chat.name
    }, {
      to: email,
      subject: invitee.firstname + " has invited you to a group on Debrief!"
    }, function(e) {
      if (e) {
        return e;
      }
    });
  }
};