'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'term': {
        key: 'term'
      },
      'chatid': {
        key: 'chatid',
        value: Chat.pidToId
      },
      'include': 'include'
    });
  },
  clean: function(data) {
    var hits = data.hits.hits;
    var rtn = [];
    hits.forEach(function(element) {
      var obj = element._source;
      obj.id = element._id;
      rtn.push(obj);
    }, this);
    return rtn;
  },
  getIds: function(data) {
    var hits = data.hits.hits;
    var ids = _.pluck(hits, '_id');
    return ids;
  },
  send: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.integration) {
        var results = data.hits.hits;
        var users = [];
        var chats = [];
        var chat_messages = [];
        var files = [];
        var contacts = [];
        var events = [];

        results.forEach(function(result) {
          switch (result._type) {
            case "chat_message_user":
              if (chat_messages.indexOf(result._id) === -1) {
                chat_messages.push(result._id);
              }
              break;
            case "chat_message_chat":
              if (chat_messages.indexOf(result._id) === -1) {
                chat_messages.push(result._id);
              }
              break;
            case "user":
              if (users.indexOf(result._id) === -1) {
                users.push(result._id);
              }
              break;
            case "chat":
              if (chats.indexOf(result._id) === -1) {
                chats.push(result._id);
              }
              break;
            case "files":
              if (files.indexOf(result._id) === -1) {
                files.push(result._id);
              }
              break;
            case "contact":
              if (contacts.indexOf(result._id) === -1) {
                contacts.push(result._id);
              }
              break
            case "event":
              if (events.indexOf(result._id) === -1) {
                events.push(result._id);
              }
              break;
          }
        }, this);

        var populateChats = function(objects) {
          var chat_message_chats = _.pluck(objects, 'chat');
          return Chat.find({
              id: chat_message_chats
            }).populate('users')
            .then(function(chats) {
              var chat_by_id = _.indexBy(chats, 'id');
              objects.forEach(function(obj) {
                obj.chat = chat_by_id[obj.chat];
              });

              return objects;
            });
        }

        var userPromise = TeamUser.find({
          id: users
        }).then((response) => {
          response.sort((a, b) => {
            return users.indexOf(a.id.toString()) - users.indexOf(b.id.toString());
          });
          return TransformerService.teamuser.send(response).then((u) => {
            users = u;
          });
        });
        var chatPromise = Chat.find({
          id: chats
        }).populate('users').then((response) => {
          response.sort((a, b) => {
            return chats.indexOf(a.id.toString()) - chats.indexOf(b.id.toString());
          });
          return TransformerService.chat.send(response).then((c) => {
            chats = c;
          });
        });
        var messagePromise = ChatMessage.find({
          id: chat_messages
        }).populate('from').then(populateChats).then((response) => {
          response.sort((a, b) => {
            return chat_messages.indexOf(a.id.toString()) - chat_messages.indexOf(b.id.toString());
          });
          return TransformerService.chatmessage.send(response).then((m) => {
            chat_messages = m;
          });
        });
        var filePromise = Files.find({
          id: files
        }).populate('user').then(populateChats).then((response) => {
          response.sort((a, b) => {
            return files.indexOf(a.id.toString()) - files.indexOf(b.id.toString());
          });
          return TransformerService.files.send(response).then((f) => {
            files = f;
          });
        });
        var contactPromise = Contact.find({
          id: contacts
        }).then((response) => {
          response.sort((a, b) => {
            return contacts.indexOf(a.id.toString()) - contacts.indexOf(b.id.toString());
          });
          return TransformerService.contact.send(response).then((c) => {
            contacts = c;
          });
        });
        var eventPromise = Event.find({
          id: events
        }).then((response) => {
          response.sort((a, b) => {
            return events.indexOf(a.id.toString()) - events.indexOf(b.id.toString());
          });
          return TransformerService.event.send(response).then((e) => {
            events = e;
          });
        });

        Promise.all([userPromise, chatPromise, messagePromise, filePromise, contactPromise, eventPromise])
          .then(function() {
            var obj = {};
            if (users.length > 0) obj.users = users;
            if (chats.length > 0) obj.chats = chats;
            if (chat_messages.length > 0) obj.messages = chat_messages;
            if (files.length > 0) obj.files = files;
            if (contacts.length > 0) obj.contacts = contacts;
            if (events.length > 0) obj.events = events;
            resolve(obj);
          })
          .catch(reject);
      } else {
        var promises = [];
        var contacts = [];
        var events = [];

        var contactTransformer = function(contact) {
          return Transformer.build(contact, {
            'remote_id': {
              key: 'remote_id'
            },
            'lastname': {
              key: 'last_name'
            },
            'firstname': {
              key: 'first_name'
            },
            'email': {
              key: 'email'
            },
            'avatar': {
              key: 'avatar'
            }
          });
        };

        var eventTransformer = function(event) {
          return Transformer.build(event, {
            'start': {
              key: 'start'
            },
            'end': {
              key: 'end'
            },
            'notes': {
              key: 'notes'
            },
            'name': {
              key: 'name'
            },
            'id': {
              key: 'id'
            },
            'local_id': {
              key: 'local_id'
            },
            'chat': {
              key: 'chat'
            },
            'attendees': {
              key: 'attendees'
            }
          });
        };

        data.hits.forEach(function(result) {
          switch (result.type) {
            case "contacts":
              if (result.integration) {
                result.content.forEach(function(content) {
                  promises.push(
                    TransformerService.contact.send(content).then(function(contact) {
                      contacts.push(contact);
                    })
                  );
                });
              } else {
                result.content.forEach(function(content) {
                  promises.push(
                    contactTransformer(content).then(function(contact) {
                      contacts.push(contact);
                    })
                  );
                });
              }
              break;
            case "events":
              result.content.forEach(function(content) {
                promises.push(
                  eventTransformer(content).then(function(event) {
                    events.push(event);
                  })
                );
              });
              break;
          }
        });

        Promise.all(promises).then(function() {
          var response = {};
          if (contacts.length > 0) response.contacts = contacts;
          if (events.length > 0) response.events = events;
          return resolve(response);
        });
      }
    });
  }
};