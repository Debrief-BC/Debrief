'use strict';

module.exports = {
  tableName: 'call_rate',
  attributes: {
    provider: {
      type: 'string'
    },
    direction: {
      type: 'string'
    },
    prefix: {
      type: 'string'
    },
    rate: {
      type: 'float'
    },
    destination: {
      type: 'string'
    }
  },
  defaultFilter: ['provider', 'direction', 'prefix', 'rate', 'destination'],
  defaultPopulate: []
}