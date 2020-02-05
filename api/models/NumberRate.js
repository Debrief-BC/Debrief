'use strict';

module.exports = {
  tableName: 'number_rate',
  attributes: {
    type: {
      type: 'string'
    },
    country: {
      type: 'string'
    },
    code: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    setup_fee: {
      type: 'float'
    },
    monthly_fee: {
      type: 'float'
    },
    setup_code: {
      type: 'string'
    },
    monthly_code: {
      type: 'string'
    },
  },
  defaultFilter: ['type', 'country', 'description', 'setup_fee', 'monthly_fee', 'setup_code', 'monthly_code'],
  defaultPopulate: []
}