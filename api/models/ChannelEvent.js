'use strict';

module.exports = {
  tableName: 'channel_event',
  attributes: {
    channel: {
      model: 'channel'
    },
    team: {
      model: 'team'
    },
    type: {
      type: 'string'
    },
    data: {
      type: 'json'
    },
    attached_route: {
      model: 'callroute'
    },
    attached_channel: {
      model: 'channel'
    },
    attached_event: {
      model: 'channelevent'
    }
  },
  defaultFilter: ['channel', 'type', 'attached_route', 'attached_channel', 'attached_event', 'createdAt', 'team'],
  defaultPopulate: ['attached_event', 'attached_channel', 'attached_route', 'channel', 'team'],
  afterCreate: function(created, cb) {
    cb();
    Channel.update({
      id: created.channel
    }, {
      end_time: new Date().toISOString()
    }).exec(function() {});
  }
}