'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Plan.pidToId
      },
      'name': {
        key: 'name'
      },
      'code': {
        key: 'code'
      },
      'price': {
        key: 'price'
      },
      'country': {
        key: 'country'
      },
      'default_plan': {
        key: 'defaultPlan'
      }
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Plan.idToPid
      },
      'name': {
        key: 'name'
      },
      'code': {
        key: 'code'
      },
      'price': {
        key: 'price'
      },
      'fusebill': {
        key: 'fusebill',
        value: Plan.list
      },
      'country': {
        key: 'country'
      },
      'defaultPlan': {
        key: 'default_plan'
      },
      'currency': {
        key: 'currency',
        value: function(currency) {
          if (currency) {
            if (currency.id) {
              return TransformerService.currency.send(currency);
            } else {
              return Currency.findOne({
                id: currency
              }).then(function(result) {
                return TransformerService.currency.send(result);
              })
            }
          } else {
            return null;
          }
        }
      }
    });
  },
  sendPlanOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object' && !Array.isArray(data)) {
      return TransformerService.plan.send(data);
    } else {
      return Plan.idToPid(data);
    }
  }
};