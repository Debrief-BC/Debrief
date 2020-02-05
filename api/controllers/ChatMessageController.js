'use strict';

/**
 * ChatMessageController
 *
 * @description :: Server-side logic for managing Chat Messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const Linkify = require('linkifyjs');
const Scrape = require('metatag-crawler');

module.exports = {

  /**
   * @api {get} /chat/:id/messages
   * @apiVersion 2.3.15
   * @apiName GetChatMessages
   * @apiGroup Chat
   *
   * @apiDescription This gets the messages in a chat. By default, it's in descending order of createdAt.
   *
   * @apiParam {integer} id the chat id
   * @apiUse queryParams
   * @apiParam {string} [type] filter by type
   * @apiParam {string} [from] filter by sender id
   *
   * @apiParam (Populate) [from]
   * @apiParam (Populate) [chat]
   *
   * @apiSuccess {Message[]} body an array of messages
   *
   * @apiUse message
   */
  findMessages(req, res) {
    let team = null;

    /**
     * Find the team associated with this chat
     */

    const findTeam = () => {
      return Chat.findOne({
        id: req.param('chatid')
      }).then((chat) => {

        if (!chat) {
          throw new Error({
            errorType: 'not_found'
          });
        }

        team = chat.team;
      });
    }

    const usersToTeamUsers = () => {
      if (req.param('from')) {
        return TeamUser.find({
          user: req.param('from'),
          team: team
        }).then((teamusers) => {
          req.query['from'] = _.pluck(teamusers, 'id');
        });
      }
    }

    const filter = () => {
      return TeamUser.findOne({
        user: req.user,
        team: team
      }).then((currentTeamUser) => {
        let options = {
          find: {
            chat: req.param('chatid')
          }
        };

        if (currentTeamUser.role === sails.config.guestRoleIndex) {
          options.find.createdAt = {
            '>': currentTeamUser.createdAt
          };
        }

        if (!req.param('sort')) {
          req.query['sort'] = 'id Desc';
        }

        return ChatMessage.filter.find(req, options);
      });
    };

    const populateCallLogTo = (messages) => {
      let call_logs = _.filter(messages, (message) => {
        return message.type == 'call_log' && message.body.to != null
      });
      if (call_logs.length > 0) {
        let tos = _.uniq(_.pluck(call_logs, 'body.to'));
        return TeamUser.find({
          user: tos,
          team: team
        }).then((users) => {
          let user_by_id = _.indexBy(users, 'user');
          call_logs.forEach((msg) => {
            msg.body.to = user_by_id[msg.body.to];
          });
          return messages;
        });
      }
      return messages
    };

    const populateParticipantMessages = (messages) => {
      let participantMessages = _.filter(messages, (message) => {
        return message.type == 'participant_added' || message.type == 'participant_removed' || message.type == 'participant_left';
      });
      if (participantMessages.length > 0) {
        let usrs = _.uniq(_.flatten(_.pluck(participantMessages, 'body')));
        return TeamUser.find({
          user: usrs,
          team: team
        }).then((users) => {
          let user_by_id = _.indexBy(users, 'user');
          participantMessages.forEach((msg) => {
            if (typeof msg.body === 'string') {
              msg.body = [user_by_id[msg.body]];
            } else {
              for (let i = 0; i < msg.body.length; i++) {
                msg.body[i] = user_by_id[msg.body[i]];
              }
            }
          });
          return messages;
        });
      }
      return messages;
    };

    const populateTextLanguage = (messages) => {
      let text_messages = _.filter(messages, (message) => {
        return message.type == 'text';
      });
      if (text_messages.length > 0) {
        let user = _.uniq(_.pluck(text_messages, 'from.user'));
        return User.find({
          id: user
        }).then((users) => {
          let user_by_id = _.indexBy(users, 'id');
          text_messages.forEach((msg) => {
            msg.language = user_by_id[msg.from.user].language;
          });
          return messages;
        });
      }
      return messages
    };

    const addDebriefUser = (messages) => {
      messages.forEach((message) => {
        if (message.type === 'debrief_hq') {
          message.language = 'en';
          message.from = {
            role: "debriefr",
            position: "Debrief HQ",
            accepted: new Date().toISOString(),
            first_name: "Debrief",
            last_name: "HQ",
            color: "fd7676",
            avatar: "https://debrief-production-files.s3.amazonaws.com/debrief-technologies-inc/chats/aa4687754d48b2bbbecd5570a0e1786ae/img_sk_logo.jpg",
            email: "support@debrief.com",
            notification: false,
            status: "active",
            state: "offline",
            extension: [
              "000"
            ],
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            deleted_at: null,
            work_number: null,
            home_number: null,
            mobile_number: null,
            website: null,
            caller_id_name: "",
            caller_id_number: "",
            voicemail: false,
            forward: false,
            forward_number: null,
            latitude: 43.6733624,
            longitude: -79.3881853,
            theme: "dark",
            thumb_url: null,
            routes: [],
            teamUserId: -1,
            id: -1,
            team: -1,
            plan: -1,
            defaultCalendar: -1,
            defaultContacts: -1,
            user: -1
          }
        }
      });

      return messages;
    }

    TransformerService.chatmessage.get(req)
      .then(findTeam)
      .then(usersToTeamUsers)
      .then(filter)
      .then(populateCallLogTo)
      .then(populateParticipantMessages)
      .then(addDebriefUser)
      //.then(populateTextLanguage)
      .then(TransformerService.chatmessage.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {post} /chat/:id/messages
   * @apiVersion 2.3.15
   * @apiName PostChatMessage
   * @apiGroup Chat
   *
   * @apiDescription This posts a message to the chat
   *
   * @apiParam {integer} id the chat id
   * @apiParam (body) {string} type the type of message
   * @apiParam (body) {JSONObject} body the body of the message data (string for text)
   *
   * @apiUse message
   */
  addMessage(req, res) {
    let chat = null;
    let fromUser = null;

    let ensureChatExists = () => {
      return Chat.findOne({
          id: req.param('chatid')
        })
        .then((c) => {
          if (!c) {
            throw new Error('chat doesn\'t exist');
          }

          chat = c;
        });
    };

    let setFrom = () => {
      fromUser = !req.isFreeswitch ? req.user : req.param('from');
      if (fromUser) {
        return TeamUser.findOne({
          team: chat.team,
          user: fromUser
        }).then((teamuser) => {
          fromUser = teamuser && teamuser.id || null;
        });
      } else {
        return TeamUser.findOne({
          team: chat.team,
          id: chat.owner
        }).then((teamuser) => {
          fromUser = teamuser && teamuser.id || null;
        });
      }
    };

    let uploadFiles = () => {

      if (req.body.type === 'file' || req.body.type === 'recording_video' && req.file) {
        return Files.upload(req, {
          user: fromUser,
          team: chat.team,
          chat: chat.id
        });
      } else if (req.body.type === 'filestack') {
        let imageTypes = ['jpg', 'jpeg', 'gif', 'png'];
        let imageSize = null;
        let file_info = req.body.body;
        file_info.extension = file_info.extension.toLowerCase();

        req.body.body = null; // NULL its body (to copy current behaviour)

        if (imageTypes.includes(file_info.extension)) {
          return ChatMessage.getImageSize(file_info.key)
            .then(size => {
              return Files.create({
                  name: escape(file_info.key),
                  extension: file_info.extension,
                  filename: escape(file_info.filename),
                  size: file_info.size,
                  team: chat.team,
                  user: fromUser,
                  chat: chat.id,
                  url: file_info.url,
                  thumbWidth: size.width || 1,
                  thumbHeight: size.height || 1,
                  thumb_url: size.thumbUrl ? `${sails.config.s3ThumbnailUrl}${size.thumbUrl}` : null
                })
                .then((response) => {
                  req.body.file = response.id
                  return;
                })
                .catch((e) => {
                  throw new Error(e);
                });
            })
            .catch(err => console.log(err));
        } else {

          return Files.create({
              name: escape(file_info.key),
              extension: file_info.extension,
              filename: escape(file_info.filename),
              size: file_info.size,
              team: chat.team,
              user: fromUser,
              chat: chat.id,
              url: file_info.url,
              thumbWidth: null,
              thumbHeight: null,
              thumb_url: null
            })
            .then((response) => {
              req.body.file = response.id
              return;
            })
            .catch((e) => {
              throw new Error(e);
            });
        }
      }

    };

    let parseLinks = () => {

      if (req.body.type === 'file' || req.body.type === 'filestack' || typeof req.body.body !== 'string' || req.body.type === 'recording_video') return;
      req.body.body = unescape(req.body.body);

      if (typeof req.body.body !== 'string') {
        req.body.body = JSON.stringify(req.body.body);
      }
      let links = Linkify.find(req.body.body);

      if (links && links.length > 0) {

        links.map((v, i) => {
          if (v.type !== "email") {
            Scrape(v.href, (err, data) => {
              if (err) {
                console.log('err', err);
                return;
              }

              let link = {
                link: data.meta.canonical || data.og.url,
                title: data.meta.title || data.og.title,
                description: data.meta.description || data.og.title,
                images: data.meta.images || data.og.images,
                user: fromUser || null,
                chat: req.param('chatid') || null
              };

              Links.createAndPublish(link).then((result) => {
                return ChatLinks.createAndPublish({
                  chat: req.param('chatid'),
                  owner: fromUser,
                  links: result.id
                });
              });
            });
          } else {
            return;
          }
        });

      }

      return;

    };

    let addMessage = (r) => {

      req.body.chat = req.param('chatid');
      req.body.from = fromUser;

      if (r && r.length > 0) {
        req.body.file = r[0].id;
      } else if (req.body.type === "filestack") {
        req.body.type = "file"; // set the type back to file to avoid multiple msg types
      }

      return ChatMessage.createAndPublish(req.body, req);
    };

    let markLastSeen = () => {
      let chatid = req.param('chatid');
      let user = fromUser;
      let body = {
        last_seen: new Date().toISOString()
      };

      return ChatUser.updateAndPublish({
        user: user,
        chat: chatid
      }, body, req);
    };

    let updateChatQueue = (chatmessage) => {

      Chat.findOne({
          id: chatmessage.chat
        })
        .populate('users')
        .then((chat) => {
          let users = chat.users;

          if (typeof req.user === 'string') {
            req.user = parseInt(req.user);
          }

          if (users) {
            users.map(user => {
              if (user.user !== req.user) {
                let chatid = Chat.idToPidSync(chat.id);
                let teamid = TeamUser.idToPidSync(user.id);
                return Queue.updateCount(chatid, teamid, 1);
              }
            });
          }
        })
        .catch((err) => {
          throw new Error('Chat Queue Update:', err.message)
        });

      return chatmessage;
    };

    let populateChatMessage = (chatmessage) => {
      if (chatmessage.type === 'file') {
        return ChatMessage.findOne({
          id: chatmessage.id
        }).populate('file');
      } else {
        return chatmessage;
      }
    };

    let TransformRequest = () => {
      return TransformerService.chatmessage.get(req);
    };

    ValidatorService.chatmessage.validateCreate(req)
      .then(TransformRequest)
      .then(ensureChatExists)
      .then(setFrom)
      .then(markLastSeen)
      .then(parseLinks)
      .then(uploadFiles)
      .then(addMessage)
      .then(updateChatQueue)
      .then(populateChatMessage)
      .then(TransformerService.chatmessage.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /chat/:id/messages/:messageid
   * @apiVersion 2.3.15
   * @apiName EditChatMessage
   * @apiGroup Chat
   *
   * @apiDescription This edits a specific message from the chat
   *
   * @apiParam {integer} id the chat id
   * @apiParam {integer} id the message id
   * @apiParam (body) {Message} body the message object
   *
   * @apiUse message
   */
  editMessage(req, res) {
    let editMessage = () => {
      return ChatMessage.updateAndPublish({
        id: req.param('messageid')
      }, req.body, req);
    };

    let TransformRequest = () => {
      return TransformerService.chatmessage.editGet(req);
    };

    ValidatorService.chatmessage.validateCreate(req)
      .then(TransformRequest)
      .then(editMessage)
      .then(TransformerService.chatmessage.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /chat/:id/messages/:messageid
   * @apiName DeleteChatMessage
   * @apiGroup Chat
   *
   * @apiDescription This deletes a specific message from the chat
   *
   * @apiParam {integer} id the chat id
   * @apiParam {integer} id the message id
   */
  deleteMessage(req, res) {
    let destroy = () => {
      return ChatMessage.destroyAndPublish({
        id: req.param('messageid')
      }, req);
    };

    TransformerService.chatmessage.get(req)
      .then(destroy)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /chat/messages/unread
   * @apiVersion 2.3.15
   * @apiName FindUnreadMessages
   * @apiGroup Chat
   *
   * @apiDescription This lists all the unread messages you have
   *
   * @apiParam {string} [team] filter by team
   * @apiParam {string} [type] filter by chat type
   * @apiParam {string} [chat] filter by chat id
   * @apiParam {string} [from] filter by the sending user id
   * @apiParam {string} [populate] the population list - can populate chat, chatusers and from
   *
   * @apiSuccess {Message[]} body an array of messages
   *
   * @apiUse message
   */
  findUnread(req, res) {
    let populate = req.param('populate') || "";
    populate = populate.split(',');

    let findUnread = () => {
      let userid = req.user;
      let team = req.param('team') || null;
      let type = req.param('type') || null;
      let chat = req.param('chat') || null;
      let fromParam = req.param('from') || null;
      return ChatMessage.findUnread(userid, team, type, chat, fromParam);
    };

    let populateChat = (chatmessages) => {
      if (populate.indexOf('chat') !== -1) {
        let msgByChat = {};
        let chatids = [];

        chatmessages.forEach((msg) => {
          if (chatids.indexOf(msg.chat) === -1) {
            msgByChat[msg.chat] = [msg];
            chatids.push(msg.chat);
          } else {
            msgByChat[msg.chat].push(msg);
          }
        }, this);

        let query = Chat.find({
          id: chatids
        });
        if (populate.indexOf('chatusers') !== -1) {
          query.populate('users');
        }

        return query.then((chats) => {
          chats.forEach((chat) => {
            msgByChat[chat.id].forEach((msg) => {
              msg.chat = chat;
            });
          });
          return chatmessages;
        });
      } else {
        return chatmessages;
      }
    };

    let populateFrom = (chatmessages) => {
      if (populate.indexOf('from') !== -1) {
        let msgByUser = {};
        let userids = [];

        chatmessages.forEach((msg) => {
          if (userids.indexOf(msg.from) === -1) {
            msgByUser[msg.from] = [msg];
            userids.push(msg.from);
          } else {
            msgByUser[msg.from].push(msg);
          }
        }, this);

        return User.find({
          id: userids
        }).then((users) => {
          users.forEach((user) => {
            msgByUser[user.id].forEach((msg) => {
              msg.from = user;
            });
          });
          return chatmessages;
        });

      } else {
        return chatmessages;
      }
    };

    TransformerService.chatmessage.getunread(req)
      .then(findUnread)
      .then(populateChat)
      .then(populateFrom)
      .then(TransformerService.chatmessage.send)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /chat/:id/files/
   * @apiVersion 2.3.15
   * @apiName GetFiles
   * @apiGroup Chat
   *
   * @apiDescription Get all the files of a related chat
   *
   * @apiParam {integer} id the chat id
   */
  findFiles(req, res) {

    let transformRequest = () => {
      return TransformerService.files.get(req);
    };

    let filterFilesInChat = () => {
      if (!req.isSuperAdmin || req.isFreeswitch) {
        return TeamUser.findOne({
          user: req.user
        }).then(teamUser => {
          let options = {
            find: {
              chat: req.param('chat')
            }
          };

          if (teamUser && teamUser.role === sails.config.guestRoleIndex) {
            options.find.createdAt = {
              '>': teamUser.createdAt
            }
          }

          return Files.filter.find(req, options);
        }).catch(err => {
          throw new Error(err);
        });
      } else {
        let options = {
          find: {
            chat: req.param('chat')
          }
        };

        return Files.filter.find(req, options);
      }

    };

    transformRequest()
      .then(filterFilesInChat)
      .then(TransformerService.files.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);

  },

  /**
   * @api {get} /chat/:id/links/
   * @apiVersion 2.3.15
   * @apiName GetLinks
   * @apiGroup Chat
   *
   * @apiDescription Get all the links for a given chat.
   *
   * @apiParam {integer} id the chat id
   */
  findLinks(req, res) {

    let transformRequest = () => {
      return TransformerService.links.get(req);
    };

    let filterLinksInChat = () => {
      if (!req.isSuperAdmin || req.isFreeswitch) {
        return TeamUser.findOne({
            user: req.user
          })
          .then(teamUser => {
            if (!req.param('sort')) {
              req.query['sort'] = 'createdAt Desc';
            }

            let options = {
              find: {
                chat: req.param('chat')
              }
            };

            if (teamUser && teamUser.role === sails.config.guestRoleIndex) {
              options.find.createdAt = {
                '>': teamUser.createdAt
              }
            }

            return Links.filter.find(req, options);
          })
          .catch(err => {
            throw new Error(err);
          })
      } else {
        let options = {
          find: {
            chat: req.param('chat')
          }
        };

        return Links.filter.find(req, options);
      }
    };

    transformRequest()
      .then(filterLinksInChat)
      .then(TransformerService.links.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);

  },

  /**
   * @api {get} /chat/:chatid/messages/:messageid/translate
   * @apiVersion 2.3.15
   * @apiName translateChatMessage
   * @apiGroup Chat
   *
   * @apiDescription This translates a specific message from the chat
   *
   * @apiParam {integer} id the chat id
   * @apiParam {integer} id the message id
   *
   * @apiUse message
   */
  translateChatMessage(req, res) {
    let translationOptions = {};
    let getMessage = () => {
      return ChatMessage.findOne({
        id: req.param('messageid')
      }).then((message) => {
        translationOptions.message = message.body;
        return message;
      });
    };

    let getTargetLanguage = (message) => {
      return User.findOne({
        id: req.user
      }).then((user) => {
        translationOptions.targetLang = user.language;
        return message;
      });
    };

    let getSourceLanguage = (message) => {
      return TeamUser.findOne({
        id: message.from
      }).then((teamUser) => {
        return User.findOne({
          id: teamUser.user
        }).then((user) => {
          translationOptions.sourceLang = user.language;
          return message;
        }).catch((e) => {
          throw new Error(e);
        });
      }).catch((e) => {
        throw new Error(e);
      });
    };

    let checkTranslation = (message) => {
      if (translationOptions.sourceLang === translationOptions.targetLang) {
        //console.log("YAY");
      }
    }

    let translate = (message) => {
      return ChatMessage.translate(translationOptions).then((translatedMessage) => {
        message.translated = true;
        message.body = translatedMessage;
        return message;
      });
    };

    TransformerService.chatmessage.get(req)
      .then(getMessage)
      .then(getTargetLanguage)
      .then(getSourceLanguage)
      .then(translate)
      .then(TransformerService.chatmessage.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /chat/:chatid/messages/:messageid/original
   * @apiVersion 2.3.15
   * @apiName originalChatMessage
   * @apiGroup Chat
   *
   * @apiDescription This translates a specific message from the chat
   *
   * @apiParam {integer} id the chat id
   * @apiParam {integer} id the message id
   *
   * @apiUse message
   */
  originalChatMessage(req, res) {
    let getMessage = () => {
      return ChatMessage.findOne({
        id: req.param('messageid')
      }).then((message) => {
        message.translated = null;
        return message;
      });
    };

    TransformerService.chatmessage.get(req)
      .then(getMessage)
      .then(TransformerService.chatmessage.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /chat/transcriptionmessage
   * @apiVersion 2.3.15
   * @apiName addTranscriptionMessage
   * @apiGroup Chat
   *
   * @apiDescription This adds the transcription chat message
   *
   * @apiParam (body) {string} the file_name for the transcription
   * @apiParam (body) {string} transcription the transcription contents
   * @apiParam (body) {string} type of the transcription
   *
   * @apiUse message
   */
  addTranscriptionMessage(req, res) {
    let fileName = req.body.file_name.substr(0, req.body.file_name.lastIndexOf('.')) || req.body.file_name;
    fileName = fileName.split("/").pop().replace('%40', '@');

    let checkType = () => {
      if (req.body.type === 'recording_video') {
        return getOriginalFile().then(addTransciptionMessageVideo);
      } else if (req.body.type === 'voicemail') {
        return getVoicemail().then(addTransciptionMessageVoicemail);
      }
    }
    let getOriginalFile = () => {
      return Files.find({
        name: {
          contains: fileName
        }
      }).then((files) => {
        if (files) {
          return ChatMessage.find({
            file: files[0].id
          });
        } else {
          return;
        }
      });
    };
    let addTransciptionMessageVideo = (chatMessage) => {
      if (chatMessage && chatMessage.length > 0 && req.body.transcription) {
        return ChatMessage.update({
          id: chatMessage[0].id
        }, {
          body: req.body.transcription
        }).then(() => {
          return;
        });
      } else {
        return;
      }
    };
    let getVoicemail = () => {
      return Files.find({
        name: {
          contains: fileName
        }
      }).then((files) => {
        if (files) {
          return Voicemail.find({
            file: files[0].id
          });
        } else {
          return;
        }
      });
    };
    let addTransciptionMessageVoicemail = (voicemail) => {
      if (voicemail && voicemail.length > 0 && req.body.transcription) {
        return Voicemail.update({
          id: voicemail[0].id
        }, {
          transcript: req.body.transcription
        }).then(() => {
          return;
        });
      } else {
        return;
      }
    };

    checkType()
      .then(res.ok)
      .catch(res.generalError);
  },
};