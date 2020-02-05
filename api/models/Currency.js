'use strict';

module.exports = {
  attributes: {
    country: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    rate: {
      type: 'float'
    },
    symbol: {
      type: 'string'
    },
  },
  defaultFilter: ['name', 'country', 'rate', 'symbol'],
  defaultPopulate: []
}