'use strict';

module.exports = {
  attributes: {
    user: {
      model: 'teamuser'
    },
    name: {
      type: 'string'
    },
    number: {
      type: 'string'
    },
    chat: {
      model: 'chat'
    },
    team: {
      model: 'team'
    },
    start_time: {
      type: 'datetime',
      defaultsTo: function() {
        return new Date().toISOString();
      }
    },
    end_time: {
      type: 'datetime',
      defaultsTo: function() {
        return new Date().toISOString();
      }
    },
    UUID: {
      type: 'string'
    },
    events: {
      collection: 'channelevent',
      via: 'channel'
    },
    attached_events: {
      collection: 'channelevent',
      via: 'attached_channel'
    }
  },
  defaultFilter: ['user', 'name', 'number', 'chat', 'start_time', 'end_time', 'uuid', 'team'],
  defaultPopulate: ['user', 'chat', 'events', 'attached_events', 'team'],
}