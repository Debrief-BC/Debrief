'use strict';

/**
 * ChatUserController
 *
 * @description :: Server-side logic for managing Chatusers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * @api {get} /chat/:id/users
   * @apiVersion 2.3.15
   * @apiName GetChatUsers
   * @apiGroup Chat
   *
   * @apiDescription This gets the users in a chat
   *
   * @apiParam {integer} id the Chat id
   *
   * @apiUse queryParams
   * @apiUse populate
   *
   * @apiParam (Populate) [user]
   *
   * @apiSuccess {ChatUser[]} body an array of chat users
   *
   * @apiSuccess (ChatUser) {User} user the user (if populated it's a full user object, otherwise it's the id)
   * @apiSuccess (ChatUser) {string} chat the chat id
   * @apiSuccess (ChatUser) {bool/null} do_not_disturb
   * @apiSuccess (ChatUser) {bool/null} favorite
   * @apiSuccess (ChatUser) {datetime} last_seen
   */
  findUsers: function(req, res) {
    var filter = function() {
      return ChatUser.filter.find(req, {
        find: {
          chat: req.param('chatid')
        }
      });
    };

    TransformerService.chatuser.get(req)
      .then(filter)
      .then(TransformerService.chatuser.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {post} /chat/:id/users
   * @apiVersion 2.3.15
   * @apiName AddChatUser
   * @apiGroup Chat
   *
   * @apiDescription This adds a user to a Chat
   *
   * @apiParam {integer} id the Chat id
   * @apiParam (body) {string/string[]} user the user or users to be added to the chat
   */
  addUsers: function(req, res) {

    let validate = ValidatorService.chatuser.validateCreate(req);
    let transformRequest = () => {
      return TransformerService.chatuser.get(req);
    };

    let chat = null;
    let events = [];

    let findChat = () => {
      chat = req.param('chatid');

      return Chat.findOne({
        id: chat
      }).populate('users');
    }

    let findEvents = (chat) => {
      return TeamUser.findOne({
        user: chat.owner,
        team: chat.team
      }).then((owner) => {
        if (owner) {
          return Event.find({
              chat: chat.id,
              user: owner.id
            })
            .then((result) => {
              if (result) {
                events = result;
              }

              return chat;
            })
            .catch(err => {
              console.log(err);
              return chat;
            });
        } else {
          return chat;
        }
      })
    }


    var addMessage = function() {
      return Chat.findOne({
        id: chat
      }).then(function(chat) {
        return TeamUser.findOne({
          user: req.param('user')[0],
          team: chat.team
        }).then((from) => {
          if (from) {
            let msg = {
              type: 'participant_added',
              body: JSON.stringify(req.param('user')),
              from: from.id,
              chat: req.param('chatid')
            };

            return ChatMessage.createAndPublish(msg);
          }
        });
      });

    };

    function addUser(user) {
      return ChatUser.addAndPublish({
        user: user,
        chat: chat
      });
    }

    function addUsers(chat) {

      var users = req.param('user');

      if (!Array.isArray(users)) {
        users = [users];
      }

      chat.users.forEach(function(f) {
        var i = users.indexOf(f.user.toString());
        if (i > -1) {
          users.splice(i, 1);
        }
      });

      return TeamUser.find({
          team: chat.team,
          user: users
        }).populate('defaultCalendar')
        .then(function(teamusers) {
          var promises = [];
          teamusers.forEach(function(user) {
            promises.push(addUser(user.id));
            if (user.accepted) {
              promises.push(sendEmail(user));
            }
            if (events.length > 0) {
              events.forEach(function(event) {
                var addEmail = user.defaultCalendar ? user.defaultCalendar.email : user.email;
                Event.addAttendeesEvent(event.id, addEmail);
                var e = {
                  chat: event.chat,
                  user: user.id,
                  organizer: event.organizer,
                  name: event.name,
                  start: event.start,
                  end: event.end,
                  notes: event.notes
                }
                Event.createAndPublish(e);
              })
            }
          });

          return Promise.all(promises);
        });
    }

    var sendEmail = function(user) {
      var getChat = function() {
        return Chat.findOne({
          id: req.param('chatid')
        }).then(function(chat) {
          return Chat.idToPid(chat.id).then(function(chatId) {
            var emailOptions = {
              chatId: chatId,
              chat: chat
            }
            return emailOptions;
          })
        });
      };

      var getInvitee = function(emailOptions) {
        return TeamUser.findOne({
          team: emailOptions.chat.team,
          user: req.user
        }).then(function(invitee) {
          emailOptions.invitee = invitee;
          return emailOptions;
        });
      };

      var postEmail = function(emailOptions) {
        if (emailOptions.chat.type !== "department") {
          ChatUser.sendEmail("GroupAdded", user, emailOptions);
        }

        return user;
      };


      return getChat()
        .then(getInvitee)
        .then(postEmail);

    };

    validate
      .then(transformRequest)
      .then(findChat)
      .then(findEvents)
      .then(addUsers)
      .then(addMessage)
      .then(TransformerService.chatuser.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /chat/:id/users/:userid
   * @apiVersion 2.3.15
   * @apiName EditChatUser
   * @apiGroup Chat
   *
   * @apiDescription This edits a chatuser instance
   *
   * @apiParam {integer} id the Chat id
   * @apiParam {integer} userid the user id
   * @apiParam (Body) {bool} [favorite]
   * @apiParam (Body) {bool} [do_not_disturb]
   * @apiParam (Body) {date} [last_seen]
   */
  editUser: function(req, res) {
    var validate = ValidatorService.chatuser.validateEdit(req);
    var transformRequest = function() {
      return TransformerService.chatuser.get(req);
    };

    // var editAllowed = function () {
    //     return new Promise(function (resolve, reject) {
    //         if (req.param('userid') !== req.user) {
    //             reject({ errorType: 'forbidden' });
    //         } else {
    //             resolve();
    //         }
    //     });
    // };
    var blockGuest = function() {
      if (typeof req.body.blocked !== "undefined") {
        return TeamUser.findOne({
          id: req.param('userid')
        }).then(function(user) {
          return GuestInvite.findOne({
            chat: req.param('chatid'),
            user: user.user
          }).then(function(guest) {
            if (guest && req.body.blocked) {
              return removeGuest(guest);
            } else if (!req.body.blocked) {
              return GuestInvite.updateAndPublish({
                id: guest.id
              }, {
                blocked: req.body.blocked
              });
            } else {
              return GuestInvite.createAndPublish({
                chat: req.param('chatid'),
                email: user.email,
                user: user.id,
                blocked: req.body.blocked
              })
            }
          })
        })
      } else {
        return {};
      }
    };

    var removeGuest = function(guest) {
      return ChatUser.findOne({
        chat: req.param('chatid'),
        user: req.param('userid')
      }).then(function(chatUser) {
        return ChatUser.removeAndPublish({
          id: chatUser.id
        }, req).then(function() {
          return GuestInvite.updateAndPublish({
            id: guest.id
          }, {
            blocked: req.body.blocked
          });
        });
      });
    };

    var editChatUser = function() {
      var chat = req.param('chatid');
      var user = req.param('userid');
      return TeamUser.rawQuery('SELECT chat_user.id FROM team_user LEFT JOIN chat_user ON chat_user.user = team_user.id WHERE team_user.user = ? AND chat_user.chat = ?', [user, chat])
        .then(function(chatuser) {
          if (!chatuser || chatuser.length == 0) return [];
          var body = req.body;

          return ChatUser.updateAndPublish({
            id: chatuser[0].id
          }, body, req);
        });
    };

    validate
      .then(transformRequest)
      // .then(editAllowed)
      .then(blockGuest)
      .then(editChatUser)
      .then(TransformerService.chatuser.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);

  },

  /**
   * @api {delete} /chat/:id/users/:userid
   * @apiVersion 2.3.15
   * @apiName DeleteChatUser
   * @apiGroup Chat
   *
   * @apiDescription This removes a user from a Chat
   *
   * @apiParam {integer} id the Chat id
   * @apiParam {integer} userid the user id
   */
  removeUser: function(req, res) {
    var validate = ValidatorService.chatuser.validateRemove(req);
    var transformRequest = function() {
      return TransformerService.chatuser.get(req);
    };
    var from = null;

    var getFromUser = function(response) {
      return Chat.findOne({
        id: response.chat
      }).then(function(chat) {
        return TeamUser.findOne({
          user: response.user,
          team: chat.team
        }).then(function(user) {
          from = user;
          return response;
        })
      })

    };

    var addMessage = function(response) {

      if (req.user === req.param('userid')) {
        var msg = {
          type: 'participant_left',
          body: JSON.stringify(req.param('userid')),
          from: from.id,
          chat: req.param('chatid')
        };
      } else {
        var msg = {
          type: 'participant_removed',
          body: JSON.stringify(req.param('userid')),
          from: from.id,
          chat: req.param('chatid')
        };
      }
      return ChatMessage.createAndPublish(msg).then(function(result) {
        return response;
      });

    };

    var destroy = function() {
      var user = req.param('userid');
      var chat = req.param('chatid');
      return ChatUser.find({
        chat: chat
      }).populate('user').then(function(chatusers) {
        var ids = [];
        var nonGuests = [];
        var guests = [];

        chatusers.forEach(function(chatuser) {
          if (chatuser.user.user == user) {
            ids.push(chatuser.id);
          } else if (chatuser.user.role != sails.config.guestRoleIndex) {
            nonGuests.push(chatuser.id);
          } else {
            guests.push(chatuser.id)
          }
        });
        if (nonGuests.length == 0 && guests.length >= 1) {
          ids.push(guests);
        }

        return ChatUser.removeAndPublish({
          id: ids
        }, req).then(function() {
          var response = {
            user: user,
            chat: chat
          };

          return response;
        });
      });
    };

    validate
      .then(transformRequest)
      .then(destroy)
      .then(getFromUser)
      .then(addMessage)
      .then(TransformerService.chatuser.send)
      .then(res.okOrNoContent)
      .catch(res.generalError);
  },

  /**
   * @api {post} /chat/:id/seen
   * @apiVersion 2.3.15
   * @apiName MarkLastSeen
   * @apiGroup Chat
   *
   * @apiDescription This marks the current time as the last time this chat was seen by the current user
   * @apiParam {string} id the chat id
   */
  markLastSeen: function(req, res) {

    let findTeamUser = () => {
      return Chat.findOne(req.param('chatid')).then((chat) => {
        return TeamUser.findOne({
          team: chat.team,
          user: req.user
        });
      });
    };

    let editChatUser = (teamuser) => {
      let chat = req.param('chatid');
      let user = teamuser.id;
      let body = {
        last_seen: new Date().toISOString()
      };

      return ChatUser.updateAndPublish({
        user: user,
        chat: chat
      }, body, req);
    };

    let updateChatQueue = (chatuser) => {

      let chatid = Chat.idToPidSync(chatuser[0].chat);
      let teamid = TeamUser.idToPidSync(chatuser[0].user);

      return Queue.resetChatCount(chatid, teamid).then((result) => {
        return chatuser;
      }).catch(e => {
        return chatuser;
      });
    };

    TransformerService.chatuser.get(req)
      .then(findTeamUser)
      .then(editChatUser)
      .then(updateChatQueue)
      .then(TransformerService.chatuser.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);

  }
};