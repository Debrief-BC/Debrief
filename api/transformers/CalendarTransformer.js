'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Calendar.idToPid
      },
      'integration': {
        key: 'integration',
        value: TransformerService.integration.sendIntegrationOrPid
      },
      'calendarId': 'calendar_id',
      'events': 'events'
    });
  },
  get(req) {

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Calendar.pidToId
      },
      'integration': {
        key: 'integration',
        value: Integration.pidToId
      },
      'start': 'start',
      'end': 'end',
      'events': 'events'
    });
  }
};