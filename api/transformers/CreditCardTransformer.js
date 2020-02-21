'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      }
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id'
      },
      'firstName': {
        key: 'first_name'
      },
      'lastName': {
        key: 'last_name'
      },
      'maskedCardNumber': {
        key: 'card_number'
      },
      'cardType': {
        key: 'card_type'
      },
      'isDefault': {
        key: 'default'
      },
      'address1': {
        key: 'address_1'
      },
      'address2': {
        key: 'address_2'
      },
      'city': {
        key: 'city'
      },
      'state': {
        key: 'state'
      },
      'stateId': {
        key: 'state_id'
      },
      'postalZip': {
        key: 'zip'
      },
      'country': {
        key: 'country'
      },
      'countryId': {
        key: 'country_id'
      },
      'expirationMonth': {
        key: 'month'
      },
      'expirationYear': {
        key: 'year'
      }
    });
  },

  sendCountries: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id'
      },
      'name': {
        key: 'name'
      },
      'iso': {
        key: 'iso'
      },
      'iso3': {
        key: 'iso3'
      },
      'states': {
        key: 'states'
      },
    });
  }
};