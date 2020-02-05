'use strict';

/**
 * ChatController
 *
 * @description :: Server-side logic for managing chats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const faker = require('faker');

module.exports = {
  /**
   * @api {get} /chat
   * @apiVersion 2.3.15
   * @apiName GetChats
   * @apiGroup Chat
   *
   * @apiDescription This gets an array of all the chats visible to the current user.
   * If this is a socket connection, it subscribes the connection to these chats.
   *
   * @apiUse queryParams
   * @apiUse populate
   *
   * @apiParam {string} [type] filters based on type ("public", "private", "room", "pstn")
   * @apiParam {string} [name] filters based on chat name
   * @apiParam {integer} [team] filters based on team id
   * @apiParam {string} [owner] filters based on the owner
   * @apiParam {string} [with] filters based on a participant (multiple instances filter as "And")
   * @apiParam {bool} [favorite] if true only grabs favorited chats, otherwise grabs all chats
   * @apiPAram {bool} [unread] if true checks how many messages are unread
   *
   * @apiParam (Populate) [users]
   * @apiParam (Populate) [messages]
   * @apiParam (Populate) [owner]
   * @apiParam (Populate) [team]
   *
   * @apiSuccess {Chat[]} body an array of chats
   *
   * @apiUse minimalChat
   * @apiUse fullChat
   * @apiUse minimalUser
   * @apiUse message
   * @apiUse minimalTeam
   */
  find(req, res) {

    let findChats = (currentteamuser) => {
      if (!currentteamuser) throw new Error({
        errorType: 'forbidden',
        response: 'you must be part of a team to list the chats in it'
      })

      let users = req.param('users');
      let favoriteParam = req.param('favorite') === 'true';
      let team = req.param('team');
      let type = req.param('type') ? req.param('type') : ['room', 'private'];

      return Chat.findChats(req.user, req.param('team'), type, req.param('last_message_time_from'), req.param('last_message_time_to'), req.param('name'), users, favoriteParam, req.param('sort'), req.param('skip'), req.param('limit'));
    };

    let getUnread = (chats) => {
      let unreadParam = req.param('unread');
      let promises = [];

      if (unreadParam) {
        let promises = chats.map((chat) => {
          return TeamUser.findOne({
              user: req.user
            })
            .then((teamuser) => {
              let chatid = Chat.idToPidSync(chat.id);
              let userid = TeamUser.idToPidSync(teamuser.id);

              let promise = Queue.getUserCount(chatid, userid).then((count) => {
                chat.unread = count ? count : 0;
              });

              promises.push(promise);
            });
        });

        return Promise.all(promises).then((resolve) => {
          return chats;
        });

      } else {
        return chats;
      }
    }

    let populateAssociations = (chats) => {
      let chats_by_id = _.indexBy(chats, 'id');
      let chatids = Object.keys(chats_by_id);
      let populateArr = req.param('populate') ? req.param('populate').split(',') : [];

      let promises = [];

      if (populateArr.indexOf('users') !== -1) {
        let users = ChatUser.find({
            chat: chatids
          }).populate('user')
          .then((chatusers) => {
            let chatusers_by_chat = _.groupBy(chatusers, 'chat');

            for (let chatid in chatusers_by_chat) {

              let cusers = _.pluck(chatusers_by_chat[chatid], 'user');
              if (cusers.length <= 1 && chats_by_id[chatid].type === "private") {
                delete chats_by_id[chatid];
              } else {
                chats_by_id[chatid].users = cusers;
              }
            }
          });
        promises.push(users);
      }

      if (populateArr.indexOf('owner') !== -1) {
        let ownerids = _.uniq(_.pluck(chats, 'owner'));
        let owner = TeamUser.find({
            id: ownerids
          })
          .then((owners) => {
            let owners_by_id = _.indexBy(owners, 'id');

            for (let chatid in chats_by_id) {
              let chat = chats_by_id[chatid];
              chat.owner = owners_by_id[chat.owner];
            }
          });
        promises.push(owner);
      }

      if (populateArr.indexOf('team') !== -1) {
        let teamids = _.uniq(_.pluck(chats, 'team'));
        let team = Team.find({
            id: teamids
          })
          .then((teams) => {
            let teams_by_id = _.indexBy(teams, 'id');

            for (let chatid in chats_by_id) {
              let chat = chats_by_id[chatid];
              chat.team = teams_by_id[chat.team];
            }
          });
        promises.push(team);
      }

      if (populateArr.indexOf('callcenter_transfer_to') !== -1) {
        let ccids = _.uniq(_.pluck(chats, 'callcenter_transfer_to'));
        let cc = CallRoute.find({
            id: ccids
          })
          .then((ccs) => {
            let cc_by_id = _.indexBy(ccs, 'id');

            for (let chatid in chats_by_id) {
              let chat = chats_by_id[chatid];
              chat.callcenter_transfer_to = cc_by_id[chat.callcenter_transfer_to];
            }
          });
        promises.push(cc);
      }

      if (populateArr.indexOf('routes') !== -1) {
        let routes = CallRoute.find({
            room: chatids
          })
          .then((routes) => {
            let routs_by_chat = _.groupBy(routes, 'room');

            for (let chatid in routs_by_chat) {
              chats_by_id[chatid].routes = routs_by_chat[chatid];
            }
          });
        promises.push(routes);
      }

      if (populateArr.indexOf('last_message') !== -1) {
        let messages = new Promise(function(resolve, reject) {
          let lastMessages = [];
          chatids.forEach((chatId) => {
            let lastMessage = ChatMessage.findOne({
                chat: chatId
              }).sort("id DESC")
              .then((msg) => {
                if (msg) {
                  let message = [msg];

                  if (message[0] && message[0].type === "call_log" && message[0].body.to && message[0].body.from) {
                    return TeamUser.findOne({
                      user: message[0].body.to
                    }).then((toUser) => {
                      return TeamUser.findOne({
                        user: message[0].body.from
                      }).then((fromUser) => {
                        if (toUser && fromUser) {
                          message[0].chat = message[0].chat.id;
                          message[0].body.to = toUser.id;
                          message[0].body.from = fromUser.id;
                          if (chats_by_id[chatId]) {
                            chats_by_id[chatId].last_message = message;
                          }
                        }
                        return;
                      }).catch((err) => {
                        throw new Error(err);
                      });
                    }).catch((err) => {
                      throw new Error(err);
                    });
                  } else {
                    if (chats_by_id[chatId] && message[0]) {
                      message[0].chat = message[0].chat.id;
                      chats_by_id[chatId].last_message = message;
                    }
                    return;
                  }
                }
              });
            lastMessages.push(lastMessage);
          });
          return Promise.all(lastMessages).then((messages) => {
            resolve(messages);
          }).catch((err) => {
            throw new Error(err);
          });
        });
        promises.push(messages);
      }

      if (populateArr.indexOf('meetings') !== -1) {
        let meetings = TeamUser.findOne({
          user: req.user,
          team: req.param('team')
        }).then((teamUser) => {
          let events = [];
          chatids.forEach((chatId) => {
            let date = new Date();
            let event = Event.find({
              chat: chatId,
              user: teamUser.id,
              end: {
                '>': date
              }
            }).populate('organizer').then((events) => {
              if (chats_by_id[chatId]) {
                chats_by_id[chatId].meetings = events;
              }
            });
            events.push(event)
          });
          return Promise.all(events);
        });
        promises.push(meetings);
      }

      if (populateArr.indexOf('blocked') !== -1) {
        let blocked = [];
        chatids.forEach((chatId) => {
          let promise = GuestInvite.find({
              chat: chatId,
              blocked: true
            })
            .then((blockedGuests) => {
              chats_by_id[chatId].blocked = blockedGuests;
            });
          blocked.push(promise);
        });
        promises.push(blocked);
      }

      return Promise.all(promises).then(() => {
        return _.values(chats_by_id);
      });
    };

    TransformerService.chat.get(req)
      .then(findChats)
      .then(getUnread)
      .then(populateAssociations)
      .then(TransformerService.chat.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {get} /team/:team/departments
   * @apiVersion 2.3.15
   * @apiName GetDepartments
   * @apiGroup Chat
   *
   * @apiDescription Gets all the departments in a given team
   * @apiUse populate
   *
   * @apiParam (Populate) [users]
   * @apiParam (Populate) [callcenter_transfer_to]
   * @apiParam (Populate) [routes]
   */
  findDepartments(req, res) {

    let findChats = () => {
      return Chat.filter.find(req, {
        find: {
          team: req.param('team'),
          type: 'department'
        }
      });
    }

    TransformerService.chat.get(req)
      .then(findChats)
      .then(TransformerService.chat.send)
      .then(res.okOrNoContent)
      .catch(res.serverError)
  },

  /**
   * @api {get} /team/:team/rooms
   * @apiVersion 2.3.15
   * @apiName GetRooms
   * @apiGroup Chat
   *
   * @apiDescription Gets all the rooms in a given team
   * @apiUse populate
   *
   * @apiParam (Populate) [users]
   * @apiParam (Populate) [callcenter_transfer_to]
   * @apiParam (Populate) [routes]
   */
  findRooms(req, res) {
    let findChats = () => {
      return Chat.filter.find(req, {
        find: {
          team: req.param('team'),
          type: 'room'
        }
      });
    }

    TransformerService.chat.get(req)
      .then(findChats)
      .then(TransformerService.chat.send)
      .then(res.okOrNoContent)
      .catch(res.serverError)
  },

  /**
   * @api {get} /chat/:id
   * @apiVersion 2.3.15
   * @apiName GetChat
   * @apiGroup Chat
   *
   * @apiDescription Gets the full details of a specific chat
   * @apiParam id The chat's unique id
   * @apiUse populate
   *
   * @apiParam (Body) {String} unread the unread count of this chat
   *
   * @apiParam (Populate) [users]
   * @apiParam (Populate) [messages]
   * @apiParam (Populate) [owner]
   * @apiParam (Populate) [team]
   *
   * @apiSuccess {Chat} body the chat object
   * @apiSuccess (Body) {String} unread the unread count of this chat
   *
   * @apiUse minimalChat
   * @apiUse fullChat
   * @apiUse minimalUser
   * @apiUse message
   * @apiUse minimalTeam
   */
  findOne(req, res) {
    let teamUser = null;

    let findChat = () => {
      return Chat.filter.findOne(req);
    };

    let findChatUser = (chat) => {
      if (req.isFreeswitch) {
        return chat;
      }

      return TeamUser.findOne({
        team: chat.team,
        user: req.user
      }).then((teamuser) => {
        teamUser = teamuser;

        return ChatUser.findOne({
          chat: chat.id,
          user: teamuser.id
        }).then((chatuser) => {

          if (chatuser) {
            chat.favorite = chatuser.favorite;
            chat.do_not_disturb = chatuser.do_not_disturb;
            chat.last_seen = chatuser.last_seen;
          }

          return chat;
        });

      });
    };

    let populateFiles = (chat) => {
      if (teamUser && req.param('populate') && req.param('populate').indexOf('files') !== -1) {

        // If User is a guest, only return the files and links
        // that are available since they joined
        if (teamUser.role === sails.config.guestRoleIndex) {
          return Files.find({
            chat: chat.id,
            team: teamUser.team,
            createdAt: {
              '>': teamUser.createdAt
            }
          }).then((chatfiles) => {
            chat.files = chatfiles;
            return chat;
          }).catch((err) => {
            throw new Error(err);
          });
        } else {
          return Files.find({
            chat: chat.id,
            team: teamUser.team
          }).then((chatfiles) => {
            chat.files = chatfiles;
            return chat;
          }).catch((err) => {
            throw new Error(err);
          });
        }
      } else {
        return chat;
      }
    };

    let populateLinks = (chat) => {
      if (teamUser && req.param('populate') && req.param('populate').indexOf('links') !== -1) {
        if (teamUser.role === sails.config.guestRoleIndex) {
          return Links.find({
            chat: chat.id,
            createdAt: {
              '>': teamUser.createdAt
            }
          }).then((chatlinks) => {
            chat.links = chatlinks;
            return chat;
          }).catch((err) => {
            throw new Error(err);
          });
        } else {
          return Links.find({
            chat: chat.id,
          }).then((chatlinks) => {
            chat.links = chatlinks;
            return chat;
          }).catch((err) => {
            throw new Error(err);
          });
        }
      } else {
        return chat;
      }
    };

    let populateMeetings = (chat) => {
      if (teamUser && req.param('populate') && req.param('populate').indexOf('meetings') !== -1) {
        let date = new Date();
        return Event.find({
          chat: chat.id,
          user: teamUser.id,
          end: {
            '>': date
          }
        }).populate('organizer').then((events) => {
          chat.meetings = events;
          return chat;
        });
      } else {
        return chat;
      }

    };

    let populateBlockedGuests = (chat) => {
      if (teamUser && req.param('populate') && req.param('populate').indexOf('blocked') !== -1) {
        return GuestInvite.find({
          chat: chat.id,
          blocked: true
        }).then((blocked) => {
          chat.blocked = blocked;
          return chat;
        });
      } else {
        return chat;
      }

    };

    let findUnread = (chat) => {
      return TeamUser.findOne({
          user: req.user
        })
        .then((teamuser) => {
          if (teamuser) {
            let chatid = Chat.idToPidSync(chat.id);
            let teamid = TeamUser.idToPidSync(teamuser.id);

            return Queue.getUserCount(chatid, teamid).then((count) => {
              chat.unread = count || 0;
              return chat;
            });
          } else {
            return chat;
          }
        });
    }

    TransformerService.chat.get(req)
      .then(findChat)
      .then(findChatUser)
      .then(populateFiles)
      .then(populateLinks)
      .then(populateMeetings)
      .then(populateBlockedGuests)
      .then(findUnread)
      .then(TransformerService.chat.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /chat
   * @apiVersion 2.3.15
   * @apiName CreateChat
   * @apiGroup Chat
   *
   * @apiDescription This creates a new Chat
   *
   * @apiParam {string} [name] The name of the chat
   * @apiParam {string} type the type of chat ("private", "room", "public", "pstn")
   * @apiParam {string} team the id of the team
   * @apiParam {string[]} users an array of the users in the chat. If it doesn't include the current user, they will be added
   *
   * @apiUse minimalChat
   * @apiUse fullChat
   */
  create(req, res) {
    let validate = ValidatorService.chat.validateCreate(req);
    let checkPermission = ValidatorService.chat.validatePermission(req.param('team'), req.user, 'can_create', req.param('type'));

    let transformRequest = () => {
      return TransformerService.chat.get(req);
    };

    let createChat = () => {
      let users = req.param('users');
      let newChat = {
        name: req.param('name') || "",
        purpose: req.param('purpose'),
        type: req.param('type'),
        team: req.param('team'),
        owner: req.isFreeswitch ? users[0] : req.user,
        users: req.param('users'),
        locked: req.param('locked'),
        url: req.param('url'),
        pin: req.param('pin'),
        callcenter_voicemail_password: req.param('callcenter_voicemail_password'),
        callcenter_ring: req.param('callcenter_ring'),
        callcenter_transfer_to: req.param('callcenter_transfer_to'),
        callcenter_hold_music: req.param('callcenter_hold_music'),
        callcenter_max_time: req.param('callcenter_max_time'),
        extension: req.param('extension')
      };

      return Chat.createChat(newChat, req);
    };

    let findChat = (chat) => {
      return Chat.findOne({
        id: chat.id
      }).populate('users').populate('routes').then((chat) => {
        let notifications = [];
        if (chat.type !== 'private' && chat.type !== 'department') {
          chat.users.forEach((user) => {
            if (user.id !== chat.owner) {
              let notification = {
                type: "chat_added",
                user: user.id,
                team: chat.team,
                chat: chat.id,
                read: false
              }
              notifications.push(notification);

              let pn = {
                chat: {
                  id: chat.id,
                  team: chat.team
                },
                type: 'participant_added',
                from: user.id,
                room_mentions: [],
                user_mentions: []
              }

              return ChatMessage.pushNotification(pn);
            }
          });
          return Notifications.createAndPublish(notifications, req).then((notification) => {
            return chat;
          }).catch((err) => {
            throw new Error(err);
          })
        } else {
          return chat;
        }
      })
    };

    let addToQueue = (chat) => {
      chat.users.map((user) => {
        Queue.addChat(
            Chat.idToPidSync(chat.id),
            TeamUser.idToPidSync(user.id)
          ).then((ch) => {
            return;
          })
          .catch((e) => {
            throw new Error('add_to_queue:', e.message);
          });
      });

      return chat;
    };

    validate
      .then(checkPermission)
      .then(transformRequest)
      .then(createChat)
      .then(findChat)
      .then(addToQueue)
      .then(TransformerService.chat.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /chat/:id
   * @apiVersion 2.3.15
   * @apiName UpdateChat
   * @apiGroup Chat
   *
   * @apiDescription This updates a Chat
   * @apiParam id The Chat's unique id.
   * @apiParam (body) {string} [name] The name of the chat
   *
   * @apiUse minimalChat
   * @apiUse fullChat
   */
  update(req, res) {

    let validate = ValidatorService.chat.validateUpdate(req);
    let transformRequest = () => {
      return TransformerService.chat.get(req)
    };
    let currentuser = null;
    let avatarFileId = null;

    let authorizeUser = () => {
      return Chat.findOne({
        id: req.param('id')
      }).then((chat) => {

        return TeamUser.findOne({
          team: chat.team,
          user: req.user,
          deletedAt: null
        }).populate('team').then((teamuser) => {

          if (!teamuser) throw {
            errorType: 'forbidden',
            response: 'You are not part of the team'
          };

          if (req.body.name && teamuser.team.name === chat.name) {
            throw {
              errorType: 'forbidden',
              response: `You can't edit this conversation name`
            }
          }

          currentuser = teamuser;

          return ChatUser.findOne({
            chat: chat.id,
            user: teamuser.id
          }).then((chatuser) => {

            if (!chatuser) {

              if (chat.type === 'department' && teamuser.role === sails.config.adminRoleIndex) {
                return chat; // we let the team admins modify their departments even if they are not in them.
              } else {

                throw new Error({
                  errorType: 'forbidden',
                  response: 'You are not part of this chat'
                })
              }

            }

            return chat;
          });
        });
      });
    };

    let uploadAvatar = (chat) => {

      if (req.body.avatar === 'true') {
        return Files.upload(req, {
          team: chat.team
        }).then((file) => {
          if (file.length > 0) {
            req.body.avatar = file[0].url;
            avatarFileId = file[0].id;
            return chat;
          }
          return chat;
        });

      } else return chat;

    }

    let removeGuests = (chat) => {

      if (req.param('locked') == true) {
        return ChatUser.find({
          chat: chat.id
        }).populate("user").then((chatusers) => {
          let promises = [];
          chatusers.forEach((chatuser) => {
            if (chatuser.user.role === sails.config.guestRoleIndex) {
              let p1 = ChatUser.removeAndPublish({
                id: chatuser.id
              }, req).then((updated) => {
                let msg = {
                  type: 'participant_removed',
                  body: [JSON.stringify(chatuser.user.user)],
                  from: currentuser.id,
                  chat: chat.id
                };

                ChatMessage.createAndPublish(msg)

                return chat;
              });

              let p2 = GuestInvite.update({
                chat: chatuser.chat,
                user: chatuser.user.id
              }, {
                deletedAt: new Date().toISOString()
              });

              promises.push([p1, p2]);
            }
          });
          return Promise.all(promises).then((updated) => {
            return chat;
          })
        })

      } else return chat;

    }

    let updatePin = (chat) => {
      if (req.param('locked')) {
        Chat.updateAndPublish({
          id: req.param('id')
        }, {
          pin: faker.random.number(9999)
        });
      }

      return chat;
    };

    let addMessage = (chat) => {
      return TeamUser.findOne({
        team: chat.team,
        user: req.user,
        deletedAt: null
      }).then((teamuser) => {
        let promises = [];

        if (req.param('name') && chat.name != req.param('name')) {

          let msg = {
            type: 'chat_renamed',
            body: JSON.stringify({
              'old': chat.name,
              'new': req.param('name')
            }),
            from: teamuser.id,
            chat: req.param('id')
          };

          promises.push(ChatMessage.createAndPublish(msg));

        }

        if (req.param('locked') == true || req.param('locked') == false) {

          let msg = {
            type: 'chat_locked',
            body: req.param('locked'),
            from: teamuser.id,
            chat: req.param('id')
          };

          promises.push(ChatMessage.createAndPublish(msg));

        }

        if (req.param('purpose') && chat.purpose != req.param('purpose')) {

          let msg = {
            type: 'chat_purpose',
            body: JSON.stringify({
              'old': chat.purpose,
              'new': req.param('purpose')
            }),
            from: teamuser.id,
            chat: req.param('id')
          };

          promises.push(ChatMessage.createAndPublish(msg));

        }

        if (req.body.avatar) {
          let msg = {
            type: 'chat_avatar',
            body: null,
            from: teamuser.id,
            chat: req.param('id'),
            file: avatarFileId
          };

          promises.push(ChatMessage.createAndPublish(msg));
        }

        return Promise.all(promises);
      });
    };

    let updateChat = (chat) => {

      return Chat.updateAndPublish({
        id: req.param('id')
      }, req.body, req);
    };

    validate
      .then(transformRequest)
      .then(authorizeUser)
      .then(uploadAvatar)
      .then(removeGuests)
      .then(updatePin)
      .then(addMessage)
      .then(updateChat)
      .then(TransformerService.chat.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /chat/:id
   * @apiVersion 2.3.15
   * @apiName DeleteChat
   * @apiGroup Chat
   *
   * @apiDescription This deletes a Chat
   * @apiParam id The Chat's unique id.
   */
  destroy(req, res) {
    let validate = ValidatorService.chat.validateUpdate(req);
    let transformRequest = () => {
      return TransformerService.chat.get(req)
    };

    let currentuser = null;

    let authorizeUser = () => {
      return Chat.findOne({
        id: req.param('id')
      }).then((chat) => {

        return TeamUser.findOne({
          team: chat.team,
          user: req.user,
          deletedAt: null
        }).then((teamuser) => {

          if (!teamuser) throw {
            errorType: 'forbidden',
            response: 'You are not part of the team'
          };
          currentuser = teamuser;

          return ChatUser.findOne({
            chat: chat.id,
            user: teamuser.id
          }).then((chatuser) => {

            if (!chatuser) throw new Error({
              errorType: 'forbidden',
              response: 'You are not part of this chat'
            });

            return chat;
          });
        });
      });
    };

    let destroyChat = () => {
      return Chat.destroyAndPublish({
        id: req.param('id')
      }, req);
    };

    let destroyChatUsers = () => {
      return ChatUser.removeAndPublish({
        chat: req.param('id')
      }, req);
    };

    validate
      .then(transformRequest)
      .then(auth)
      .then(destroyChat)
      .then(destroyChatUsers)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
  /**
   * @api {get} /chat/:roomNumber/conference
   * @apiVersion 2.3.15
   * @apiName findChatByRoomNumber
   * @apiGroup Chat
   *
   * @apiDescription Gets the chat id and conf_pin for a chat
   *
   */
  findChatByRoomNumber(req, res) {
    let findChat = () => {
      return Chat.findOne({
          roomNumber: req.param('roomNumber')
        })
        .then((chat) => {
          if (!chat) throw new Error({
            errorType: 'notfound',
            response: 'chat with this room number is not found'
          });

          return chat;
        });
    }

    let findTeam = (chat) => {
      return Team.findOne({
        id: chat.team
      }).then((team) => {
        let response = {
          id: chat.id,
          conf_pin: chat.conf_pin,
          slug: team.slug
        }

        return response;
      });
    }
    findChat()
      .then(findTeam)
      .then(TransformerService.chat.sendConference)
      .then(res.okOrNoContent)
      .catch(res.serverError)
  },

  /**
   * @api {get} /chat/:id/generateUrl
   * @apiVersion 2.3.15
   * @apiName generateChatUrl
   * @apiGroup Chat
   *
   * @apiDescription Generates a new url for a chat, and removes all guests
   *
   */
  generateUrl: (req, res) => {
    let transformRequest = () => {
      return TransformerService.chat.get(req)
    };

    const findChatUser = (id) => {
      return ChatUser.find({
        chat: id
      }).populate('user');
    };

    const findTeamUser = (user, team) => {
      return TeamUser.findOne({
        user: user,
        team: team
      });
    };

    const sendNotification = (user, from, team, type, message) => {
      return UserDevice.sendNotification(user, from, team, type, message);
    }

    let removeAllGuests = () => {

      return findChatUser(req.param('id'))
        .then((chatusers) => {
          return findTeamUser(req.user, chatusers[0].team)
            .then((from) => {
              let promises = [];
              chatusers.forEach((chatuser) => {
                if (chatuser.user.role === sails.config.guestRoleIndex) {
                  let p1 = ChatUser.removeAndPublish({
                    id: chatuser.id
                  }, req).then((updated) => {
                    let msg = {
                      type: 'participant_removed',
                      body: [JSON.stringify(chatuser.user.user)],
                      from: from.id,
                      chat: req.param('id')
                    };
                    return ChatMessage.createAndPublish(msg);
                  });

                  let p2 = GuestInvite.update({
                    chat: chatuser.chat,
                    user: chatuser.user.id
                  }, {
                    deletedAt: new Date().toISOString()
                  });

                  promises.push([p1, p2]);
                }
              });
            });

          return Promise.all(promises);
        });
    };

    let updatePin = () => {
      return Chat.updateAndPublish({
        id: req.param('id')
      }, {
        pin: faker.random.number(9999)
      });
    };

    let pushNotification = (chat) => {
      return findChatUser(chat[0].id)
        .then(chatUsers => {
          chatUsers.forEach(chatuser => {
            if (chatuser.user.role !== sails.config.guestRoleIndex) {
              let fromObj = {
                chat: chatuser.chat,
                user: chatuser.from,
                caller_id_name: null,
                caller_id_number: null
              };

              let body = {
                pin: chat[0].pin
              }

              sendNotification(chatuser.user.user, fromObj, chatuser.team, 'pin_changed', body);
            }
          });
        })
        .then(() => chat)
        .catch(res.generalError);
    }

    transformRequest()
      .then(removeAllGuests)
      .then(updatePin)
      .then(pushNotification)
      .then(TransformerService.chat.send)
      .then(res.okOrNotFound)
      .catch(res.throwError)

  }
};