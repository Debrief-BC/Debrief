'use strict';

var google = require('googleapis');
var calendar = google.calendar('v3');
var ews = require('node-ews');
var moment = require('moment');
var emojione = require('emojione');

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    start: {
      type: 'datetime',
      required: true
    },
    end: {
      type: 'datetime'
    },
    organizer: {
      model: 'teamuser',
      required: true
    },
    user: {
      model: 'teamuser',
      required: true
    },
    chat: {
      model: 'chat'
    },
    notes: {
      type: 'text'
    },
    deletedAt: {
      type: 'datetime'
    },
    integration: {
      type: 'int'
    },
    integrationId: {
      type: 'string'
    }
  },

  /***********************
   *
   * Find Event
   *
   ***********************/

  getEvent: function(integration, id) {
    switch (integration.provider) {
      case 'google':
        return Event.getGCalEvent(integration, id);
        break;
      case 'office365':
      case 'exchange':
        return Event.getExchangeEvent(integration, id);
      default:
        return null;
        break;
    }
  },
  getGCalEvent: function(integration, id) {
    var grabEvent = function(gAuth) {
      return new Promise(function(resolve, reject) {
        var opts = {
          auth: gAuth,
          calendarId: integration.email,
          eventId: id
        };

        calendar.events.get(opts, {}, function(err, result) {
          if (err) return reject(err);
          return resolve(result);
        });
      });
    }

    var filterName = function(event) {
      return new Promise(function(resolve, reject) {
        var name = event.summary;
        if (event.summary !== null && event.summary !== undefined && event.summary.includes("Invitation:")) {
          var re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
          name = name.replace(re, "$2");
        }
        name = emojione.toShort(name);
        return resolve(name);
      });
    }

    var associateChats = function(event) {
      return filterName(event).then(function(name) {
        return TeamUser.findOne({
          user: integration.owner
        }).then(function(owner) {
          return Event.find({
            user: owner.id,
            name: name
          }).then(function(chatEvent) {
            chatEvent.forEach(function(chatEvent) {
              var eventDate = new Date(event.start.dateTime)
              if (chatEvent.start.getTime() === eventDate.getTime()) {
                event.chat = chatEvent;
              }
            })
            return event;
          });
        });
      });
    }

    return Integration.authGoogle(integration)
      .then(grabEvent)
      .then(associateChats)
      .then(TransformerService.event.sendGoogleEvent)
      .catch(function(err) {
        console.log(err.message);
        return err.message;
      });
  },

  getExchangeEvent: function(integration, id) {
    var grabEvent = function(exch) {
      var ewsFunction = "GetItem";

      var ewsArgs = {
        'ItemShape': {
          'BaseShape': 'AllProperties'
        },
        'ItemIds': {
          'ItemId': {
            'attributes': {
              'Id': id
            }
          }
        }
      };

      return exch.run(ewsFunction, ewsArgs)
        .then(function(result) {
          if (result.ResponseMessages.GetItemResponseMessage.Items.CalendarItem) {
            return result.ResponseMessages.GetItemResponseMessage.Items.CalendarItem;
          } else {
            return null;
          }
        })
        .catch(function(err) {
          console.log(err.message);
          return err.message;
        });

    }

    var filterName = function(event) {
      return new Promise(function(resolve, reject) {
        var name = event.Subject;
        if (event.Subject !== null && event.Subject !== undefined && event.Subject.includes("Invitation:")) {
          var re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
          name = name.replace(re, "$2");
        }
        name = emojione.toShort(name);
        return resolve(name);
      });
    }

    var associateChats = function(event) {
      return filterName(event).then(function(name) {
        return TeamUser.findOne({
          user: integration.owner
        }).then(function(owner) {
          return Event.find({
            user: owner.id,
            name: name
          }).then(function(chatEvent) {
            chatEvent.forEach(function(chatEvent) {
              var eventDate = new Date(event.Start)
              if (chatEvent.start.getTime() === eventDate.getTime()) {
                event.chat = chatEvent;
              }
            })
            return event;
          });
        });
      });
    }

    return Integration.authExchange(integration)
      .then(grabEvent)
      .then(associateChats)
      .then(TransformerService.event.sendExchangeEvent)
      .catch(function(err) {
        console.log(err.message);
        return err.message;
      });
  },

  /***********************
   *
   * List Events
   *
   ***********************/

  listEvents: function(integration, start_date, end_date, chatid, search) {
    switch (integration.provider) {
      case 'google':
        return Event.listGCalEvents(integration, start_date, end_date, chatid, search);
        break;
      case 'office365':
      case 'exchange':
        return Event.listExchangeEvents(integration, start_date, end_date, chatid, search);
        break;
      default:
        break;
    }
  },
  listGCalEvents: function(integration, start_date, end_date, chatid, search) {
    var grabCalendar = function(gAuth) {
      return new Promise(function(resolve, reject) {
        var opts = {
          auth: gAuth,
          calendarId: integration.email,
          singleEvents: true,
          orderBy: 'startTime'
        };

        if (start_date && end_date) {
          opts.timeMin = start_date;
          opts.timeMax = end_date;
        }

        if (chatid) {
          opts.sharedExtendedProperty = "chatId=" + Chat.idToPidSync(chatid);
        }

        if (search) {
          opts.q = search;
        }

        calendar.events.list(opts, {}, function(err, result) {
          if (err) return reject(err);
          return resolve(result.items);
        })
      });
    }

    var filterNames = function(events) {
      return new Promise(function(resolve, reject) {
        var names = _.pluck(events, 'summary');
        var response = [];
        names.forEach(function(name) {
          if (name !== null && name !== undefined) {
            if (name.includes("Invitation:")) {
              var re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
              name = name.replace(re, "$2");
            }
            name = emojione.toShort(name);
            response.push(name);
          }
        })
        return resolve(response);
      });
    }

    var associateChats = function(events) {
      return filterNames(events).then(function(names) {
        return TeamUser.findOne({
          user: integration.owner
        }).then(function(owner) {
          return Event.find({
            user: owner.id,
            name: names
          }).then(function(chatEvents) {
            chatEvents.forEach(function(chatEvent) {
              var indexes = [],
                i;
              for (i = 0; i < names.length; i++) {
                if (names[i] === chatEvent.name) {
                  indexes.push(i);
                }
              }
              if (indexes.length > 0) {
                indexes.forEach(function(index) {
                  var eventDate = new Date(events[index].start.dateTime)
                  if (chatEvent.start.getTime() === eventDate.getTime()) {
                    events[index].chat = chatEvent;
                  }
                })
              }
            })
            return events;
          });
        });
      });
    }

    return Integration.authGoogle(integration)
      .then(grabCalendar)
      .then(associateChats)
      .then(TransformerService.event.sendGoogleEvent)
      .catch(function(err) {
        console.log(err.message);
        return err.message;
      });
  },

  listExchangeEvents: function(integration, start_date, end_date, chatid, search) {
    return new Promise(function(resolve, reject) {
      return Integration.authExchange(integration).then(function(exch) {
        var getFolderID = function() {
          var ewsFunction = "GetFolder";

          var ewsArgs = {
            'FolderShape': {
              'BaseShape': 'IdOnly',
            },
            'FolderIds': {
              'DistinguishedFolderId': {
                'attributes': {
                  'Id': 'calendar'
                }
              }
            }
          }

          return exch.run(ewsFunction, ewsArgs)
            .then(function(result) {
              return result.ResponseMessages.GetFolderResponseMessage.Folders.CalendarFolder.FolderId.attributes.Id;
            });
        }
        var grabCalendar = function(folder) {
          var ewsFunction = "FindItem";

          var ewsArgs = {
            'attributes': {
              'Traversal': 'Shallow'
            },
            'ItemShape': {
              'BaseShape': 'IdOnly',
            },
            'ParentFolderIds': {
              'FolderId': {
                'attributes': {
                  'Id': folder
                }
              }
            }
          }

          if (start_date && end_date) {
            ewsArgs.CalendarView = {
              'attributes': {
                'StartDate': start_date,
                'EndDate': end_date
              }
            }
          }
          if (search) {
            ewsArgs.QueryString = search;
          }

          return exch.run(ewsFunction, ewsArgs)
            .then(function(result) {
              if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items) {
                if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem) {
                  return result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem;
                } else {
                  return null;
                }
              } else {
                return null;
              }

            });
        }
        var grabCalendarProperties = function(ids) {
          if (ids) {
            var ewsFunction = "GetItem";

            var ewsArgs = {
              'ItemShape': {
                'BaseShape': 'AllProperties',
                'BodyType': 'Text'
              },
              'ItemIds': {
                'ItemId': []
              }
            }
            if (Array.isArray(ids)) {
              ids.forEach(function(id) {
                ewsArgs.ItemIds.ItemId.push({
                  'attributes': {
                    'Id': id.ItemId.attributes.Id
                  }
                });
              });
            } else {
              ewsArgs.ItemIds.ItemId.push({
                'attributes': {
                  'Id': ids.ItemId.attributes.Id
                }
              });
            }

            return exch.run(ewsFunction, ewsArgs)
              .then(function(result) {
                var returnArray = []
                if (result.ResponseMessages.GetItemResponseMessage) {
                  if (Array.isArray(result.ResponseMessages.GetItemResponseMessage)) {
                    result.ResponseMessages.GetItemResponseMessage.forEach(function(item) {
                      returnArray.push(item.Items.CalendarItem);
                    });
                  } else {
                    returnArray.push(result.ResponseMessages.GetItemResponseMessage.Items.CalendarItem)
                  }
                  return returnArray;
                } else {
                  return null;
                }
              });
          } else {
            return null;
          }
        }

        var filterNames = function(events) {
          return new Promise(function(resolve, reject) {
            var names = _.pluck(events, 'Subject');
            var response = [];
            names.forEach(function(name) {
              if (name !== null && name !== undefined) {
                if (name.includes("Invitation:")) {
                  var re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
                  name = name.replace(re, "$2");
                }
                name = emojione.toShort(name);
                response.push(name);
              }
            });
            return resolve(response);
          });
        }

        var associateChats = function(events) {
          return filterNames(events).then(function(names) {
            return TeamUser.findOne({
              user: integration.owner
            }).then(function(owner) {
              return Event.find({
                user: owner.id,
                name: names
              }).then(function(chatEvents) {
                chatEvents.forEach(function(chatEvent) {
                  var indexes = [],
                    i;
                  for (i = 0; i < names.length; i++) {
                    if (names[i] === chatEvent.name) {
                      indexes.push(i);
                    }
                  }
                  if (indexes.length > 0) {
                    indexes.forEach(function(index) {
                      var eventDate = new Date(events[index].Start)
                      if (chatEvent.start.getTime() === eventDate.getTime()) {
                        events[index].chat = chatEvent;
                      }
                    })
                  }
                })
                return TransformerService.event.sendExchangeEvent(events);
              });
            });
          });
        }

        return getFolderID()
          .then(grabCalendar)
          .then(grabCalendarProperties)
          .then(associateChats)
          .then(function(response) {
            return resolve(response);
          })
          .catch(function(err) {
            if (err.message === "Basic Auth StatusCode 401: Unauthorized." || err.message.includes("Invalid or malformed wsdl file") || err.message.includes("Invalid URI")) {
              var err = new Error({
                'type': 'invalid',
                'message': 'The integration details are invalid',
                'integration': {
                  'email': integration.email,
                  'provider': integration.provider
                }
              });
              err.type = "invalid";
              reject(err);
            } else {
              reject(err.message);
            }
          });
      });
    });
  },

  /***********************
   *
   * Create Event
   *
   ***********************/

  createOnProvider: function(integration, data) {
    var users = null;
    var notifications = [];
    var create = function() {
      switch (integration.provider) {
        case 'google':
          return Event.createGCalEvent(integration, data, users);
          break;
        case 'office365':
        case 'exchange':
          return Event.createExchangeEvent(integration, data, users);
          break;
        default:
          break;
      }
      return null;
    }
    if (data.chat) {
      return Chat.findOne({
        id: data.chat
      }).populate(['users', 'team']).then(function(chat) {
        return TeamUser.findOne({
          user: integration.owner,
          team: chat.team.id
        }).then(function(owner) {
          return Chat.idToPid(chat.pin).then(function(chatPid) {
            var users_by_id = _.indexBy(chat.users, 'id');
            if (data.guests && chat.locked && chat.type == 'room') {
              Chat.update({
                id: chat.id
              }, {
                locked: false
              }).exec(function(err, data) {});
            }
            if (chat.type == 'room') {
              if (!/Guest Access Link: .*/.test(data.notes)) {
                data.notes.replace(!/Guest Access Link: .*/, '');
                data.notes.replace(!/Conference Number: .*/, '');
                data.notes.replace(!/Conference Pin: .*/, '');
              }
              data.notes += "\n Global dial-in numbers: ";
              sails.config.globalConference.forEach(function(number) {
                data.notes += "\n      " + number.formatted;
              });
              data.notes += "\n Conversation Name: " + chat.name;
              data.notes += "\n Conference Number: " + chat.roomNumber;
              data.notes += "\n Conference Pin: " + chat.conf_pin;

              if (sails.config.chatGuestUrl && data.guests) {
                data.notes += "\n Guest Access Link: " + sails.config.chatGuestUrl.replace(':teamslug', chat.team.slug).replace(':chaturl', encodeURIComponent(chat.url)).replace(':pin', chatPid).replace(':chatname', encodeURIComponent(chat.name));
              }
            }

            return TeamUser.find({
              id: Object.keys(users_by_id)
            }).populate('defaultCalendar').then(function(teamusers) {
              return GuestInvite.find({
                chat: chat.id
              }).then(function(guests) {
                var guests_by_user = _.indexBy(guests, 'user');
                if (data.override) {
                  users = data.override;
                } else {
                  users = chat.users;
                }

                return create().then(function(integrationResponse) {

                  // Create event for other users
                  teamusers.forEach(function(teamuser) {

                    if (teamuser.id !== owner.id) {
                      if (teamuser.defaultCalendar && teamuser.defaultCalendar.email) {
                        users_by_id[teamuser.id].email = teamuser.defaultCalendar.email;
                      } else if (guests_by_user[teamuser.user]) {
                        users_by_id[teamuser.id].email = guests_by_user[teamuser.user].email;
                      }
                      var event = {
                        user: teamuser.id,
                        chat: chat.id,
                        start: data.start,
                        end: data.end,
                        name: emojione.toShort(data.name),
                        organizer: owner.id,
                        notes: data.notes
                      }

                      Event.createAndPublish(event);
                    }
                  });

                  // Create event for owner
                  var event = {
                    user: owner.id,
                    chat: chat.id,
                    start: data.start,
                    end: data.end,
                    name: emojione.toShort(data.name),
                    organizer: owner.id,
                    notes: data.notes,
                    integration: integration.id,
                    integrationId: integrationResponse.id
                  }

                  return Event.createAndPublish(event).then(function(response) {
                    integrationResponse.local_id = Event.idToPid(response.id);
                    integrationResponse.chat = TransformerService.chat.send(chat);
                    return integrationResponse;
                  }).catch(function(err) {
                    console.log(err.message);
                    return integrationResponse;
                  });
                });
              });
            });
          });
        });
      });
    } else {
      return create();
    }
  },
  createGCalEvent: function(integration, event, users) {
    var e = {
      summary: event.name,
      description: event.notes || '',
      start: {
        dateTime: event.start,
        timeZone: sails.config.default_timezone.google,
      },
      end: {
        dateTime: event.end || '',
        timeZone: sails.config.default_timezone.google,
      },
      attendees: []
    };
    var participantById = {};

    if (Array.isArray(users) && users.length > 0) {
      users.forEach(function(user) {
        e.attendees.push({
          email: user.email
        });
        participantById[user.id] = user.email;
      })
    }

    if (Array.isArray(event.guests) && event.guests.length > 0) {
      event.guests.forEach(function(guest) {
        e.attendees.push({
          email: guest
        });
      });
    }

    return Integration.authGoogle(integration).then(function(auth) {
      return new Promise(function(resolve, reject) {
        calendar.events.insert({
          auth: auth,
          calendarId: integration.email,
          resource: e,
          sendNotifications: true
        }, function(err, result) {
          if (err) reject(err);
          if (event.chat) {
            result.chat = {
              chat: event.chat
            };
          }
          TransformerService.event.sendGoogleEvent(result).then(resolve).catch(reject);
        });
      });
    });

  },

  createExchangeEvent: function(integration, event, users) {

    return Integration.authExchange(integration).then(function(exch) {

      var ewsFunction = "CreateItem";

      var ewsArgs = {
        'attributes': {
          'SendMeetingInvitations': 'SendToAllAndSaveCopy'
        },
        'Items': {
          'CalendarItem': {
            'Subject': event.name,
            "Body": {
              "attributes": {
                "BodyType": "Text"
              },
              "$value": event.notes || ''
            },
            'Start': event.start,
            'End': event.end,
            'Location': event.roomId,
            'RequiredAttendees': {
              'Attendee': []
            }
          }
        }
      };

      if (integration.provider == 'office365') {
        ewsArgs.Items.CalendarItem.StartTimeZone = {
          'attributes': {
            'Id': sails.config.default_timezone.microsoft
          }
        };
        ewsArgs.Items.CalendarItem.EndTimeZone = {
          'attributes': {
            'Id': sails.config.default_timezone.microsoft
          }
        };
      }

      var participantById = {};

      if (Array.isArray(users) && users.length > 0) {
        users.forEach(function(user) {
          if (user.email !== integration.email) {
            ewsArgs.Items.CalendarItem.RequiredAttendees.Attendee.push({
              'Mailbox': {
                'EmailAddress': user.email
              }
            });
          }
          participantById[user.id] = user.email;
        })
      }

      if (Array.isArray(event.guests) && event.guests.length > 0) {
        event.guests.forEach(function(guest) {
          ewsArgs.Items.CalendarItem.RequiredAttendees.Attendee.push({
            'Mailbox': {
              'EmailAddress': guest
            }
          });
        });
      }

      return exch.run(ewsFunction, ewsArgs)
        .then(function(result) {
          return Event.getExchangeEvent(integration, result.ResponseMessages.CreateItemResponseMessage.Items.CalendarItem.ItemId.attributes.Id)
        })
        .catch(function(err) {
          console.log(err.message);
          return err.message;
        });
    });
  },

  /***********************
   *
   * Update Event
   *
   ***********************/

  updateOnProvider: function(integration, eventid, data) {
    var users = null;
    var update = function() {
      switch (integration.provider) {
        case 'google':
          return Event.updateGCalEvents(integration, eventid, data, users);
          break
        case 'office365':
        case 'exchange':
          return Event.updateExchangeEvent(integration, eventid, data, users);
          break;
        default:
          break;
      }
      return null;
    }

    if (data.local_id && data.name || data.start || data.end || data.notes) {
      var e = {};
      if (data.name) e.name = emojione.toShort(data.name);
      if (data.name && data.name.includes("Invitation:")) {
        var re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
        data.name = data.name.replace(re, "$2");
      }
      if (data.start) e.start = data.start;
      if (data.end) e.end = data.end;
      if (data.notes) e.notes = data.notes;
    }

    if (data.chat) {
      return Chat.findOne({
        id: data.chat
      }).populate('users').then(function(chat) {
        users = chat.users;
        if (e) {
          return Event.findOne({
            id: data.local_id
          }).then(function(event) {
            if (event.user === event.organizer) {
              return Event.updateAndPublish({
                chat: event.chat,
                createdAt: event.createdAt
              }, e).then(function(result) {
                return update();
              });
            } else {
              return Event.updateAndPublish({
                id: data.local_id
              }, e).then(function(result) {
                return update();
              });
            }
          });
        } else {
          return update();
        }
      });
    } else {
      if (e) {
        return Event.findOne({
          id: data.local_id
        }).then(function(event) {
          if (event.user === event.organizer) {
            return Event.updateAndPublish({
              chat: event.chat,
              createdAt: event.createdAt
            }, e).then(function(result) {
              return update();
            });
          } else {
            return Event.updateAndPublish({
              id: data.local_id
            }, e).then(function(result) {
              return update();
            });
          }
        });
      } else {
        return update();
      }
    }
  },
  updateGCalEvents: function(integration, eventid, event, users) {
    var e = {};

    if (event.name) e.summary = event.name;
    if (event.notes) e.description = event.notes;
    if (event.start) e.start = {
      dateTime: event.start
    };
    if (event.end) e.end = {
      dateTime: event.end
    };
    if (users || event.guests) e.attendees = [];

    var participantById = {};

    if (Array.isArray(users) && users.length > 0) {
      users.forEach(function(user) {
        e.attendees.push({
          email: user.email
        });
        participantById[user.id] = user.email;
      })
    }

    if (Array.isArray(event.guests) && event.guests.length > 0) {
      event.guests.forEach(function(guest) {
        e.attendees.push({
          email: guest
        });
      });
    }

    return Integration.authGoogle(integration).then(function(auth) {
      return new Promise(function(resolve, reject) {
        calendar.events.patch({
          auth: auth,
          calendarId: integration.email,
          eventId: eventid,
          resource: e,
          sendNotifications: true
        }, function(err, event) {
          if (err) reject(err);
          TransformerService.event.sendGoogleEvent(event).then(resolve).catch(reject);
        });
      });
    });

  },
  updateExchangeEvent: function(integration, eventid, event, users) {
    var ewsFunction = "UpdateItem";

    var ewsArgs = {
      'attributes': {
        'ConflictResolution': 'AlwaysOverwrite',
        'SendMeetingInvitationsOrCancellations': 'SendToAllAndSaveCopy'
      },
      'ItemChanges': {
        'ItemChange': {
          'ItemId': {
            'attributes': {
              'Id': eventid
            }
          },
          'Updates': {
            'SetItemField': []
          }
        }
      }
    };

    if (event.name) {
      var subject = {
        'FieldURI': {
          'attributes': {
            'FieldURI': "item:Subject"
          }
        },
        'CalendarItem': {
          'Subject': event.name
        }
      }
      ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.push(subject);
    }
    if (event.notes) {
      var body = {
        'FieldURI': {
          'attributes': {
            'FieldURI': "item:Body"
          }
        },
        'CalendarItem': {
          'Body': event.notes
        }
      }
      ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.push(body);
    }
    if (event.start) {
      var start = {
        'FieldURI': {
          'attributes': {
            'FieldURI': "calendar:Start"
          }
        },
        'CalendarItem': {
          'Start': event.start
        }
      }
      ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.push(start);
    }
    if (event.end) {
      var end = {
        'FieldURI': {
          'attributes': {
            'FieldURI': "calendar:End"
          }
        },
        'CalendarItem': {
          'End': event.end
        }
      }
      ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.push(end);
    }
    var attendees = [];
    var reqAttendees = {
      'FieldURI': {
        'attributes': {
          'FieldURI': "calendar:RequiredAttendees"
        }
      },
      'CalendarItem': {
        'RequiredAttendees': {
          'Attendee': []
        }
      }
    }

    var participantById = {};

    if (Array.isArray(users) && users.length > 0) {
      users.forEach(function(user) {
        if (user.email !== integration.email) {
          reqAttendees.CalendarItem.RequiredAttendees.Attendee.push({
            'Mailbox': {
              'EmailAddress': user.email
            }
          });
        }
        participantById[user.id] = user.email;
      })
    }

    if (Array.isArray(event.guests) && event.guests.length > 0) {
      event.guests.forEach(function(guest) {
        reqAttendees.CalendarItem.RequiredAttendees.Attendee.push({
          'Mailbox': {
            'EmailAddress': guest
          }
        });
      });
    }
    if (users || event.guests) {
      ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.push(reqAttendees);
    }

    return Integration.authExchange(integration).then(function(exch) {
      return exch.run(ewsFunction, ewsArgs)
        .then(function(result) {
          return Event.getExchangeEvent(integration, result.ResponseMessages.UpdateItemResponseMessage.Items.CalendarItem.ItemId.attributes.Id)
        })
        .catch(function(err) {
          console.log(err.message);
          return err.message;
        });
    });
  },

  /***********************
   *
   * Update Event
   *
   ***********************/

  destroyEvent: function(integration, eventid) {
    switch (integration.provider) {
      case 'google':
        return Event.destroyGCalEvents(integration, eventid);
        break;
      case 'office365':
      case 'exchange':
        return Event.destroyExchangeEvents(integration, eventid);
      default:
        break;
    }
    return null;
  },
  destroyGCalEvents: function(integration, eventid) {
    return Integration.authGoogle(integration).then(function(auth) {
      return new Promise(function(resolve, reject) {
        calendar.events.delete({
          auth: auth,
          calendarId: integration.email,
          eventId: eventid
        }, function(err, event) {
          if (err) reject(err);
          resolve('ok')
        });
      });
    });
  },
  destroyExchangeEvents: function(integration, eventid) {
    return Integration.authExchange(integration).then(function(exch) {
      var ewsFunction = "DeleteItem";

      var ewsArgs = {
        'attributes': {
          'DeleteType': 'MoveToDeletedItems',
          'SendMeetingCancellations': 'SendToAllAndSaveCopy'
        },
        'ItemIds': {
          'ItemId': {
            'attributes': {
              'Id': eventid
            },
          }
        }
      };
      return exch.run(ewsFunction, ewsArgs)
        .then(function(result) {
          return "ok";
        })
        .catch(function(err) {
          console.log(err.message);
          return err.message;
        });
    });
  },
  removeAttendeesEvent: function(eventId, removeEmail) {
    return Event.findOne({
      id: eventId
    }).populate('chat').then(function(event) {
      return TeamUser.findOne({
        id: event.organizer
      }).populate('defaultCalendar').then(function(organizer) {
        switch (organizer.defaultCalendar.provider) {
          case 'google':
            return Event.removeAttendeesGCalEvents(organizer.defaultCalendar, event, removeEmail);
            break;
          case 'office365':
          case 'exchange':
            return Event.removeAttendeesExchangeEvents(organizer.defaultCalendar, event, removeEmail);
          default:
            break;
        }
        return null;
      });
    });
  },
  removeAttendeesGCalEvents: function(integration, event, removeEmail) {
    var grabCalendar = function(gAuth) {
      return new Promise(function(resolve, reject) {
        var opts = {
          auth: gAuth,
          calendarId: integration.email,
          singleEvents: true,
          orderBy: 'startTime',
          timeMin: event.start.toISOString(),
          timeMax: event.end.toISOString(),
          q: event.name
        };

        calendar.events.list(opts, {}, function(err, result) {
          if (err) return reject(err);
          return resolve(result.items);
        })
      });
    }
    return Integration.authGoogle(integration).then(function(auth) {
      return grabCalendar(auth).then(function(events) {
        return new Promise(function(resolve, reject) {
          events[0].attendees.forEach(function(attendee, index) {
            if (attendee.email.toLowerCase() === removeEmail) {
              events[0].attendees.splice(index, 1);
            }
          })
          calendar.events.patch({
            auth: auth,
            calendarId: integration.email,
            eventId: events[0].id,
            resource: events[0]
          }, function(err, event) {
            if (err) reject(err);
            TransformerService.event.sendGoogleEvent(event).then(resolve).catch(reject);
          });
        });
      });
    });
  },
  removeAttendeesExchangeEvents: function(integration, event, removeEmail) {
    return Integration.authExchange(integration).then(function(exch) {
      var getFolderID = function() {
        var ewsFunction = "GetFolder";

        var ewsArgs = {
          'FolderShape': {
            'BaseShape': 'IdOnly',
          },
          'FolderIds': {
            'DistinguishedFolderId': {
              'attributes': {
                'Id': 'calendar'
              }
            }
          }
        }

        return exch.run(ewsFunction, ewsArgs)
          .then(function(result) {
            return result.ResponseMessages.GetFolderResponseMessage.Folders.CalendarFolder.FolderId.attributes.Id;
          });
      }
      var grabCalendar = function(folder) {
        var ewsFunction = "FindItem";

        var ewsArgs = {
          'attributes': {
            'Traversal': 'Shallow'
          },
          'ItemShape': {
            'BaseShape': 'IdOnly',
          },
          'CalendarView ': {
            'attributes': {
              'StartDate': event.start.toISOString(),
              'EndDate': event.end.toISOString()
            }
          },
          'ParentFolderIds': {
            'FolderId': {
              'attributes': {
                'Id': folder
              }
            }
          },
          'QueryString': event.name,
        }

        return exch.run(ewsFunction, ewsArgs)
          .then(function(result) {
            if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items) {
              if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem) {
                return result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem;
              } else {
                return null;
              }
            } else {
              return null;
            }

          });
      }
      var grabCalendarProperties = function(ids) {
        if (ids) {
          var ewsFunction = "GetItem";

          var ewsArgs = {
            'ItemShape': {
              'BaseShape': 'AllProperties',
              'BodyType': 'Text'
            },
            'ItemIds': {
              'ItemId': []
            }
          }
          if (Array.isArray(ids)) {
            ids.forEach(function(id) {
              ewsArgs.ItemIds.ItemId.push({
                'attributes': {
                  'Id': id.ItemId.attributes.Id
                }
              });
            });
          } else {
            ewsArgs.ItemIds.ItemId.push({
              'attributes': {
                'Id': ids.ItemId.attributes.Id
              }
            });
          }

          return exch.run(ewsFunction, ewsArgs)
            .then(function(result) {
              var returnArray = []
              if (result.ResponseMessages.GetItemResponseMessage) {
                if (Array.isArray(result.ResponseMessages.GetItemResponseMessage)) {
                  result.ResponseMessages.GetItemResponseMessage.forEach(function(item) {
                    returnArray.push(item.Items.CalendarItem);
                  });
                } else {
                  returnArray.push(result.ResponseMessages.GetItemResponseMessage.Items.CalendarItem)
                }
                return returnArray;
              } else {
                return null;
              }
            });
        } else {
          return null;
        }
      }
      var removeAttendees = function(calendars) {
        var ewsFunction = "UpdateItem";

        var ewsArgs = {
          'attributes': {
            'ConflictResolution': 'AutoResolve',
            'SendMeetingInvitationsOrCancellations': 'SendToAllAndSaveCopy'
          },
          'ItemChanges': {
            'ItemChange': {
              'ItemId': {
                'attributes': {
                  'Id': calendars[0].ItemId.attributes.Id,
                  'ChangeKey': calendars[0].ItemId.attributes.ChangeKey
                }
              },
              'Updates': {
                'SetItemField': {
                  'FieldURI': {
                    'attributes': {
                      'FieldURI': "calendar:RequiredAttendees"
                    }
                  },
                  'CalendarItem': {
                    'RequiredAttendees': {
                      'Attendee': []
                    }
                  }
                }
              }
            }
          }
        };
        if (calendars[0].RequiredAttendees) {
          if (!Array.isArray(calendars[0].RequiredAttendees.Attendee)) {
            calendars[0].RequiredAttendees.Attendee = [calendars[0].RequiredAttendees.Attendee]
          }
          calendars[0].RequiredAttendees.Attendee.forEach(function(attendee) {
            if (attendee.Mailbox.EmailAddress.toLowerCase() !== removeEmail) {
              ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.CalendarItem.RequiredAttendees.Attendee.push({
                'Mailbox': {
                  'EmailAddress': attendee.Mailbox.EmailAddress
                }
              })
            }
          })
        }
        return Integration.authExchange(integration).then(function(exch) {
          return exch.run(ewsFunction, ewsArgs)
            .then(function(result) {
              if (result.ResponseMessages.UpdateItemResponseMessage.attributes.ResponseClass !== 'Sucess' && result.ResponseMessages.UpdateItemResponseMessage.MessageText && result.ResponseMessages.UpdateItemResponseMessage.MessageText.includes("change key passed in the request does not match the current change key")) {
                return Event.removeAttendeesEvent(event.id, removeEmail)
              } else {
                return Event.getExchangeEvent(integration, result.ResponseMessages.UpdateItemResponseMessage.Items.CalendarItem.ItemId.attributes.Id)
              }
            })
            .catch(function(err) {
              console.log(err.message);
              return err.message;
            });
        });
      }

      return getFolderID()
        .then(grabCalendar)
        .then(grabCalendarProperties)
        .then(removeAttendees)
    });
  },

  addAttendeesEvent: function(eventId, addEmail) {
    return Event.findOne({
      id: eventId
    }).then(function(userEvent) {
      return TeamUser.findOne({
        id: userEvent.organizer
      }).populate('defaultCalendar').then(function(organizer) {
        return Event.findOne({
          chat: userEvent.chat,
          organizer: userEvent.organizer,
          start: userEvent.start,
          end: userEvent.end
        }).populate('chat').then(function(event) {
          switch (organizer.defaultCalendar.provider) {
            case 'google':
              return Event.addAttendeesGCalEvents(organizer.defaultCalendar, event, addEmail);
              break;
            case 'office365':
            case 'exchange':
              return Event.addAttendeesExchangeEvents(organizer.defaultCalendar, event, addEmail);
            default:
              break;
          }
          return null;
        })
      });
    });
  },
  addAttendeesGCalEvents: function(integration, event, addEmail) {
    var grabCalendar = function(gAuth) {
      return new Promise(function(resolve, reject) {
        var opts = {
          auth: gAuth,
          calendarId: integration.email,
          singleEvents: true,
          orderBy: 'startTime',
          timeMin: event.start.toISOString(),
          timeMax: event.end.toISOString(),
          q: event.name
        };

        calendar.events.list(opts, {}, function(err, result) {
          if (err) return reject(err);
          return resolve(result.items);
        })
      });
    }
    return new Promise(function(resolve, reject) {
      return Integration.authGoogle(integration).then(function(auth) {
        return grabCalendar(auth).then(function(events) {
          if (Array.isArray(addEmail)) {
            addEmail.forEach(function(email) {
              events[0].attendees.push({
                email: email
              });
            })
          } else {
            events[0].attendees.push({
              email: addEmail
            });
          }
          calendar.events.patch({
            auth: auth,
            calendarId: integration.email,
            eventId: events[0].id,
            resource: events[0]
          }, function(err, event) {
            if (err) reject(err);
            TransformerService.event.sendGoogleEvent(event).then(resolve).catch(reject);
          });
        });
      });
    });
  },
  addAttendeesExchangeEvents: function(integration, event, addEmail) {
    return Integration.authExchange(integration).then(function(exch) {
      var getFolderID = function() {
        var ewsFunction = "GetFolder";

        var ewsArgs = {
          'FolderShape': {
            'BaseShape': 'IdOnly',
          },
          'FolderIds': {
            'DistinguishedFolderId': {
              'attributes': {
                'Id': 'calendar'
              }
            }
          }
        }

        return exch.run(ewsFunction, ewsArgs)
          .then(function(result) {
            return result.ResponseMessages.GetFolderResponseMessage.Folders.CalendarFolder.FolderId.attributes.Id;
          });
      }
      var grabCalendar = function(folder) {
        var ewsFunction = "FindItem";

        var ewsArgs = {
          'attributes': {
            'Traversal': 'Shallow'
          },
          'ItemShape': {
            'BaseShape': 'IdOnly',
          },
          'ParentFolderIds': {
            'FolderId': {
              'attributes': {
                'Id': folder
              }
            }
          },
          'QueryString': "Subject:" + event.name,
        }

        return exch.run(ewsFunction, ewsArgs)
          .then(function(result) {
            if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items) {
              if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem) {
                return result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem;
              } else {
                return null;
              }
            } else {
              return null;
            }

          });
      }
      var grabCalendarProperties = function(ids) {
        if (ids) {
          var ewsFunction = "GetItem";

          var ewsArgs = {
            'ItemShape': {
              'BaseShape': 'AllProperties',
              'BodyType': 'Text'
            },
            'ItemIds': {
              'ItemId': []
            }
          }
          if (Array.isArray(ids)) {
            ids.forEach(function(id) {
              ewsArgs.ItemIds.ItemId.push({
                'attributes': {
                  'Id': id.ItemId.attributes.Id
                }
              });
            });
          } else {
            ewsArgs.ItemIds.ItemId.push({
              'attributes': {
                'Id': ids.ItemId.attributes.Id
              }
            });
          }

          return exch.run(ewsFunction, ewsArgs)
            .then(function(result) {
              var returnArray = []
              if (result.ResponseMessages.GetItemResponseMessage) {
                if (Array.isArray(result.ResponseMessages.GetItemResponseMessage)) {
                  result.ResponseMessages.GetItemResponseMessage.forEach(function(item) {
                    returnArray.push(item.Items.CalendarItem);
                  });
                } else {
                  returnArray.push(result.ResponseMessages.GetItemResponseMessage.Items.CalendarItem)
                }
                return returnArray;
              } else {
                return null;
              }
            });
        } else {
          return null;
        }
      }
      var addAttendees = function(calendars) {
        var ewsFunction = "UpdateItem";

        var ewsArgs = {
          'attributes': {
            'ConflictResolution': 'AutoResolve',
            'SendMeetingInvitationsOrCancellations': 'SendToAllAndSaveCopy'
          },
          'ItemChanges': {
            'ItemChange': {
              'ItemId': {
                'attributes': {
                  'Id': calendars[0].ItemId.attributes.Id,
                  'ChangeKey': calendars[0].ItemId.attributes.ChangeKey
                }
              },
              'Updates': {
                'SetItemField': {
                  'FieldURI': {
                    'attributes': {
                      'FieldURI': "calendar:RequiredAttendees"
                    }
                  },
                  'CalendarItem': {
                    'RequiredAttendees': {
                      'Attendee': []
                    }
                  }
                }
              }
            }
          }
        };
        if (Array.isArray(addEmail)) {
          addEmail.forEach(function(email) {
            ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.CalendarItem.RequiredAttendees.Attendee.push({
              'Mailbox': {
                'EmailAddress': email
              }
            })
          })
        } else {
          ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.CalendarItem.RequiredAttendees.Attendee.push({
            'Mailbox': {
              'EmailAddress': addEmail
            }
          })
        }
        if (calendars[0].RequiredAttendees) {
          if (!Array.isArray(calendars[0].RequiredAttendees.Attendee)) {
            calendars[0].RequiredAttendees.Attendee = [calendars[0].RequiredAttendees.Attendee]
          }
          calendars[0].RequiredAttendees.Attendee.forEach(function(attendee) {
            ewsArgs.ItemChanges.ItemChange.Updates.SetItemField.CalendarItem.RequiredAttendees.Attendee.push({
              'Mailbox': {
                'EmailAddress': attendee.Mailbox.EmailAddress
              }
            })
          })
        }
        return Integration.authExchange(integration).then(function(exch) {
          return exch.run(ewsFunction, ewsArgs)
            .then(function(result) {
              if (result.ResponseMessages.UpdateItemResponseMessage.attributes.ResponseClass !== 'Sucess' && result.ResponseMessages.UpdateItemResponseMessage.MessageText && result.ResponseMessages.UpdateItemResponseMessage.MessageText.includes("change key passed in the request does not match the current change key")) {
                return Event.addAttendeesEvent(event.id, addEmail)
              } else {
                return Event.getExchangeEvent(integration, result.ResponseMessages.UpdateItemResponseMessage.Items.CalendarItem.ItemId.attributes.Id)
              }
            })
            .catch(function(err) {
              console.log(err.message);
              return err.message;
            });
        });
      }

      return getFolderID()
        .then(grabCalendar)
        .then(grabCalendarProperties)
        .then(addAttendees)
    });
  },

  afterCreate: function(created, cb) {
    cb();
    if (created.user !== created.organizer) {
      return Event.findOne({
        id: created.id
      }).populate('user').then(function(event) {
        var notification = {
          type: 'event',
          user: event.user.id,
          team: event.user.team,
          event_owner: event.organizer,
          chat: event.chat,
          read: false
        }
        Notifications.createAndPublish(notification);
      })
    }
    Event.findOne({
      id: created.id
    }).populate("chat").then(function(event) {
      Search.create({
          name: event.name,
          user: event.user,
          organizer: event.organizer,
          start: event.start.toString(),
          end: event.end.toString(),
          team: event.chat.team
        },
        event.id,
        'event',
        event.chat.id);
    });
  },

  afterUpdate: function(updated, cb) {
    cb();
    Event.findOne({
      id: updated.id
    }).populate("chat").then(function(event) {
      Search.update({
          name: event.name,
          user: event.user.id,
          organizer: event.organizer,
          start: event.start.toString(),
          end: event.end.toString(),
          team: event.chat.team
        },
        event.id,
        'event',
        event.chat.id);
    });
  },

  afterDestroy: function(deleted, cb) {
    cb();
    Search.destroy(deleted.id, 'event', deleted.chat);
  },



};