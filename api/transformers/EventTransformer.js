'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    if (req.body && req.user) {
      req.body.owner = req.user;
    }

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: function(id) {
          return id.replace(/-/g, "/")
        }
      },
      'integration': {
        key: 'integration',
        value: Calendar.pidToId
      },
      'start': {
        key: 'start'
      },
      'end': {
        key: 'end'
      },
      'name': 'name',
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'notes': 'notes',
      'guests': 'guests',
      'local_id': {
        key: 'local_id',
        value: Event.pidToId
      },
      'override': 'override'
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': 'id',
      'notes': 'notes',
      'start': 'start',
      'end': 'end',
      'name': 'name',
      'attendees': 'attendees',
      'chat': {
        key: 'chat',
        value: Chat.sendChatOrPid
      },
      'local_id': {
        key: 'local_id'
      },
      'calendar': {
        key: 'calendar',
        value: TransformerService.calendar.send
      }
    });
  },
  googleDate: function(date, newobj, srcobj) {
    if (date.dateTime) return date.dateTime;
    else if (date.date) {
      return date.date;
    }
    return date;
  },
  sendGoogleEvent: function(data) {
    return Transformer.build(data, {
      'start': {
        key: 'start',
        value: TransformerService.event.googleDate
      },
      'end': {
        key: 'end',
        value: TransformerService.event.googleDate
      },
      'description': {
        key: 'notes',
        value: function(notes, newobj, srcobj) {
          if (notes) {
            if (srcobj.chat && srcobj.chat.notes) {
              return srcobj.chat.notes;
            } else {
              return notes;
            }
          } else {
            return null;
          }
        }
      },
      'summary': 'name',
      'attendees': {
        key: 'attendees',
        value: function(attendees, newobj, srcobj) {
          if (srcobj.chat) {
            return ChatUser.find({
              chat: srcobj.chat.chat
            }).then(function(chatUsers) {
              var userIds = _.pluck(chatUsers, 'user')
              return TeamUser.find({
                id: userIds
              }).populate('defaultCalendar').then(function(users) {
                return GuestInvite.find({
                  chat: srcobj.chat.chat
                }).then(function(guests) {
                  var orgAttendees = attendees;
                  attendees = [];
                  var calendars = _.pluck(users, 'defaultCalendar');
                  var users_by_email = _.indexBy(users, 'email');
                  var users_by_id = _.indexBy(users, 'user');
                  var guests_by_email = _.indexBy(guests, 'email');
                  orgAttendees.forEach(function(attendee) {
                    var status = 'pending'
                    if (attendee.responseStatus === 'accepted') status = 'accepted';
                    if (users_by_email[attendee.email]) {
                      if (users_by_email[attendee.email].role === sails.config.guestRoleIndex) {
                        var blocked = false;
                        if (guests_by_email[attendee.email]) blocked = guests_by_email[attendee.email].blocked;
                        var attendee = {
                          email: attendee.email,
                          user: users_by_email[attendee.email].id,
                          status: status,
                          type: 'guest',
                          blocked: blocked
                        }
                        attendees.push(attendee);
                      } else {
                        var attendee = {
                          email: attendee.email,
                          user: users_by_email[attendee.email].id,
                          status: status,
                          type: 'user'
                        }
                        attendees.push(attendee);
                      }
                    } else if (_.findLastIndex(calendars, {
                        email: attendee.email
                      }) != -1) {
                      var index = _.findLastIndex(calendars, {
                        email: attendee.email
                      })
                      var attendee = {
                        email: attendee.email,
                        user: users[index].id,
                        status: status,
                        type: 'user'
                      }
                      attendees.push(attendee);
                    } else if (guests_by_email[attendee.email] && users_by_id[guests_by_email[attendee.email].user]) {
                      var user = guests_by_email[attendee.email].user
                      var attendee = {
                        email: attendee.email,
                        user: users_by_id[user].id,
                        status: status,
                        type: 'guest',
                        blocked: guests_by_email[attendee.email].blocked
                      }
                      attendees.push(attendee);
                    } else {
                      var blocked = false;
                      if (guests_by_email[attendee.email]) blocked = guests_by_email[attendee.email].blocked;
                      var attendee = {
                        email: attendee.email,
                        status: status,
                        type: "guest",
                        blocked: blocked
                      }
                      attendees.push(attendee);
                    }
                  })

                  return Transformer.build(attendees, {
                    'email': 'email',
                    'type': "type",
                    'user': {
                      key: 'user',
                      value: function(user) {
                        if (user) {
                          return TeamUser.findOne({
                            id: user
                          }).then(TransformerService.teamuser.send);
                        }
                        return null;
                      }
                    },
                    'status': 'status',
                    'blocked': 'blocked'
                  }).catch(function(err) {
                    console.error("THE ERROR IS HERE");
                    console.error(attendees_by_email, attendee_ids)
                    throw err;
                  });
                });
              });
            });
          } else {
            return null;
          }
        }
      },
      'id': 'id',
      'chat': {
        key: 'chat',
        value: function(ext_prop, newobj, srcobj) {
          if (ext_prop && ext_prop.chat) {
            return Event.idToPid(ext_prop.id).then(function(eventId) {
              newobj.local_id = eventId;
              return Chat.findOne({
                id: ext_prop.chat
              }).populate('users').then(TransformerService.chat.send)
            })
          }
          return null;
        }
      }
    });
  },
  sendExchangeEvent: function(data) {
    return Transformer.build(data, {
      'Start': {
        key: 'start'
      },
      'End': {
        key: 'end'
      },
      'Body': {
        key: 'notes',
        value: function(body, newobj, srcobj) {
          if (body.$value) {
            if (srcobj.chat) {
              return srcobj.chat.notes;
            } else {
              return body.$value;
            }
          } else {
            return null;
          }
        }
      },
      'Subject': 'name',
      'RequiredAttendees': {
        key: 'attendees',
        value: function(attendees, newobj, srcobj) {
          if (srcobj.chat) {
            return ChatUser.find({
              chat: srcobj.chat.chat
            }).then(function(chatUsers) {
              var userIds = _.pluck(chatUsers, 'user')
              return TeamUser.find({
                id: userIds
              }).populate('defaultCalendar').then(function(users) {
                return GuestInvite.find({
                  chat: srcobj.chat.chat
                }).then(function(guests) {
                  var organizer = srcobj.Organizer;
                  organizer.Mailbox.EmailAddress = organizer.Mailbox.EmailAddress.toLocaleLowerCase();
                  organizer.ResponseType = "Accept";
                  if (Array.isArray(attendees.Attendee)) {
                    attendees.Attendee.push(organizer);
                    var orgAttendees = attendees.Attendee;
                  } else {
                    var orgAttendees = [attendees.Attendee, organizer];
                  }
                  var filtered = [];
                  orgAttendees.forEach(function(attendee) {
                    var newAttendee = {
                      EmailAddress: attendee.Mailbox.EmailAddress.toLowerCase(),
                      status: attendee.ResponseType
                    }
                    filtered.push(newAttendee)
                  })
                  attendees = [];
                  var calendars = _.pluck(users, 'defaultCalendar');
                  var users_by_email = _.indexBy(users, 'email');
                  var users_by_id = _.indexBy(users, 'user');
                  var guests_by_email = _.indexBy(guests, 'email');
                  filtered.forEach(function(attendee) {
                    var status = "pending";
                    if (attendee.responseStatus === 'Accept') status = 'accepted';
                    if (users_by_email[attendee.EmailAddress]) {
                      if (users_by_email[attendee.EmailAddress].role === sails.config.guestRoleIndex) {
                        var blocked = false;
                        if (guests_by_email[attendee.EmailAddress]) blocked = guests_by_email[attendee.EmailAddress].blocked;
                        var attendee = {
                          email: attendee.EmailAddress,
                          user: users_by_email[attendee.EmailAddress].id,
                          status: status,
                          type: 'guest',
                          blocked: blocked
                        }
                        attendees.push(attendee);
                      } else {
                        var attendee = {
                          email: attendee.EmailAddress,
                          user: users_by_email[attendee.EmailAddress].id,
                          status: status,
                          type: 'user'
                        }
                        attendees.push(attendee);
                      }
                    } else if (_.findLastIndex(calendars, {
                        email: attendee.email
                      }) != -1) {
                      var index = _.findLastIndex(calendars, {
                        email: attendee.email
                      })
                      var attendee = {
                        email: attendee.email,
                        user: users[index].id,
                        status: status,
                        type: 'user'
                      }
                      attendees.push(attendee);
                    } else if (guests_by_email[attendee.EmailAddress] && users_by_id[guests_by_email[attendee.EmailAddress].user]) {
                      var user = guests_by_email[attendee.EmailAddress].user
                      var attendee = {
                        email: attendee.EmailAddress,
                        user: users_by_id[user].id,
                        status: status,
                        type: 'guest',
                        blocked: guests_by_email[attendee.EmailAddress].blocked
                      }
                      attendees.push(attendee);
                    } else {
                      var blocked = false;
                      if (guests_by_email[attendee.EmailAddress]) blocked = guests_by_email[attendee.EmailAddress].blocked;
                      var attendee = {
                        email: attendee.EmailAddress,
                        status: status,
                        type: "guest",
                        blocked: blocked
                      }
                      attendees.push(attendee);
                    }
                  })

                  return Transformer.build(attendees, {
                    'email': 'email',
                    'type': "type",
                    'user': {
                      key: 'user',
                      value: function(user) {
                        if (user) {
                          return TeamUser.findOne({
                            id: user
                          }).then(TransformerService.teamuser.send);
                        }
                        return null;
                      }
                    },
                    'status': 'status'
                  }).catch(function(err) {
                    console.error("THE ERROR IS HERE");
                    console.error(attendees_by_email, attendee_ids)
                    throw err;
                  });
                });
              });
            });
          } else {
            return null;
          }
        }
      },
      'ItemId': {
        key: 'id',
        value: function(itemId) {
          return itemId.attributes.Id
        }
      },
      'chat': {
        key: 'chat',
        value: function(ext_prop, newobj, srcobj) {
          if (ext_prop && ext_prop.chat) {
            return Event.idToPid(ext_prop.id).then(function(eventId) {
              newobj.local_id = eventId;
              return Chat.findOne({
                id: ext_prop.chat
              }).populate('users').then(TransformerService.chat.send)
            })
          }
          return null;
        }
      }
    });
  },
  sendChatEvent: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'local_id',
        value: Event.idToPid
      },
      'integrationId': {
        key: 'id'
      },
      'chat': {
        key: 'chat',
        value: Chat.idToPid
      },
      'notes': 'notes',
      'start': 'start',
      'end': 'end',
      'name': 'name',
      'user': {
        key: 'user',
        value: TeamUser.idToPid
      },
      'organizer': {
        key: 'organizer',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'integration': {
        key: 'integration',
        value: Integration.idToPid
      }
    });
  },
  getAddGuests: function(req) {
    if (req.body && req.user) {
      req.body.owner = req.user;
    }

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: function(id) {
          return id.replace(/-/g, "/")
        }
      },
      'integration': {
        key: 'integration',
        value: Calendar.pidToId
      },
      'emails': {
        key: 'emails'
      },
    });
  },
};