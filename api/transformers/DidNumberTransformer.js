'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Team.idToPid
      },
      'did_id': {
        key: 'did_id',
        value: DidNumber.idToPid
      },
      'number': 'number',
      'name': 'name',
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'call_route': {
        key: 'call_route',
        value: TransformerService.callroute.sendCallRouteOrPid
      },
      "createdAt": "created_at"
    });
  },
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'did_id': {
        key: 'did_id',
        value: DidNumber.idToPid
      },
      'name': 'name',
      'number': 'number',
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'call_route': {
        key: 'call_route',
        value: CallRoute.pidToId
      }
    });
  },
  getByNumber: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: DidNumber.idToPid
      },
      'name': 'name',
      'number': 'number',
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'call_route': {
        key: 'call_route',
        value: CallRoute.pidToId
      }
    });
  },
  getAutoreception: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      "didGroupId": "didGroupId"
    });
  },
  sendCountries: function(countries) {
    return Transformer.build(countries, {
      "countryCodeA3": "code",
      "countryName": "countryName"
    });
  },
  sendStates: function(states) {
    return Transformer.build(states, {
      "stateId": "stateId",
      "stateName": "stateName",
      "stateCode": "code",
    });
  },
  sendCities: function(states) {
    return Transformer.build(states, {
      "areaCode": "areaCode",
      "available": "available",
      "cityName": "cityName",
      "didGroupId": "didGroupId"
    });
  },
  sendNumberPrices: function(numbers) {
    return Transformer.build(numbers, {
      'id': {
        key: 'id',
        value: NumberRate.idToPid
      },
      "type": {
        key: 'type'
      },
      "country": {
        key: 'country'
      },
      "code": {
        key: 'code'
      },
      "description": {
        key: 'description'
      },
      "setup_fee": {
        key: 'setup_fee'
      },
      "monthly_fee": {
        key: 'monthly_fee'
      },
      "setup_code": {
        key: 'setup_code'
      },
      "monthly_code": {
        key: 'monthly_code'
      }
    });
  },
  getBuyNumber: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      "didGroupId": "didGroupId",
      "country": "country"
    });
  },
};