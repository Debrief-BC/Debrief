'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  validateInvite: function(req) {
    var response = {};
    return Validator.respond(response);
  },
  validateEdit: function() {
    var response = {};
    return Validator.respond(response);
  },
  validateCreate: function(input) {
    var response = {};

    if (!input) {
      response = {
        'first_name': 'First Name is required',
        'pin': 'Pin is required',
        'chat': 'Chat slug is required',
        'team': 'Team slug is required'
      };
    } else {
      if (!input.first_name) {
        response.first_name = 'First Name is required';
      }

      if (!input.pin) {
        response.pin = 'PIN is required';
      }

      if (!input.chat) {
        response.chat = 'Chat slug is required';
      }

      if (!input.team) {
        response.team = 'Team slug is required';
      }

      if (input.email) {
        if (!Validation.isEmail(input.email)) {
          response.email = 'Email is invalid';
        }
      } else {
        response.email = 'Email is required';
      }

      var findTeam = () => {
        return Team.findOne({
            slug: input.team
          })
          .then(team => {
            if (team.activated === "paywall") {
              response.team = "Trial has ended";
            }

            return {
              response: response,
              team: team
            };
          }).catch((e) => {
            console.log(e);
          });
      };

      var findChatInTeam = data => {
        return Chat
          .findOne({
            team: data.team.id,
            url: input.chat
          }).then(chat => {
            return Chat.pidToId(input.pin).then(pin => {

              if (chat.locked) {
                data.response.chat = "Chat is locked";
              }

              if (typeof pin === 'string') {
                pin = parseInt(pin);
              }

              if ((pin && chat.pin !== pin) || pin === 0) {
                data.response.chat = 'PIN does not match';
              }

              return {
                response: data.response,
                chat: chat
              };
            });
          });
      };

      let findGuestBlocked = data => {
        return GuestInvite.find({
          chat: data.chat.id
        }).populate('user').then(guestInvites => {

          let interestedUser = guestInvites.findIndex(user => {

            if (user.email === input.email) {
              return user && user.blocked;
            };
          });

          if (interestedUser !== -1) {
            data.response.chat = 'User is not allowed access to this chat';
          }

          return data.response;
        });
      };

      return findTeam().then(findChatInTeam).then(findGuestBlocked).then(response => {

        return Validator.respond(response);

      });


    }

  }
};