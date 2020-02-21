'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(calllog) {
    return Transformer.build(calllog, {
      'billing_succeeded': 'billing_succeeded',
      'billed_duration': 'billed_duration',
      'tick_length': 'tick_length',
      'low_funds': 'low_funds',
      'stop_call': 'stop_call',
      'session_uuid': 'session_uuid',
      'charge_amount': 'charge_amount',
      'rate': 'rate'
    });
  },
  get: function(req) {
    return Transformer.buildGet(req, {
      'slug': {
        key: 'team',
        value: function(slug) {
          return Team.findOne({
            slug: slug
          }).then(function(team) {
            return team.id || null;
          });
        }
      },
      'session_uuid': 'session_uuid',
      'tick_length': 'tick_length',
      'billed_duration': 'billed_duration',
      'direction': {
        key: 'direction',
        value: function(dir) {
          if (dir) return dir;
          return 'both';
        }
      },
      'provider': 'provider',
      'pstn_number': 'pstn_number'
    });
  },
  sendCredits: function(calllog) {
    return Transformer.build(calllog, {
      'team': {
        key: 'id',
        value: Team.idToPid
      },
      'amount': 'amount',
    });
  },
};