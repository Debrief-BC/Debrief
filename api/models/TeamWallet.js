'use strict';

module.exports = {
  tableName: 'team_wallet',
  attributes: {
    team: {
      model: 'team'
    },
    notifications: {
      type: 'boolean'
    },
    threshold: {
      type: 'integer'
    },
    auto_refill: {
      type: 'boolean'
    },
    refill_amount: {
      type: 'integer'
    },
    refill_point: {
      type: 'integer'
    }
  },
  defaultFilter: ['notifications', 'threshold', 'auto_refill', 'refill_amount', 'refill_point', 'team'],
  defaultPopulate: ['team'],

}