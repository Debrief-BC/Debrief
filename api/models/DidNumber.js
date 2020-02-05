'use strict';
var Voxbone = require('@debrief/voxbone-provisioning-node')(sails.config.voxbone);

module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    number: {
      type: 'string',
      required: true,
      unique: true
    },
    team: {
      model: 'team',
      required: true
    },
    call_route: {
      model: 'callroute'
    }
  },
  defaultFilter: ['number', 'team'],
  defaultPopulate: ['team', 'call_route'],

  listCountries: function(options) {
    return Voxbone.listCountries(options).then(function(countries) {
      if (countries.errors) throw countries.errors
      return countries.countries
    })
  },
  listStates: function(country) {
    return Voxbone.listStates(country).then(function(states) {
      if (states.errors) throw states.errors
      return states.states;
    })
  },
  listVoiceURI: function() {
    return Voxbone.listVoiceURI({
        pageNumber: "0",
        pageSize: "20"
      }).then(function(voiceUri) {
        return voiceUri;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  createVoiceURI: function(uri, description) {
    return Voxbone.createOrUpdateVoiceURI({
        voiceUriProtocol: "SIP",
        uri: uri,
        description: description
      }).then(function(voiceUri) {
        return voiceUri.voiceUri;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  applyConfiguration: function(did, uriId) {
    return Voxbone.applyConfiguration({
        didIds: [did],
        voiceUriId: uriId
      }).then(function(config) {
        return config;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  listDids: (orderReference, e164Pattern) => {
    return Voxbone.listDid({
        pageNumber: "0",
        pageSize: "20",
        orderReference: orderReference,
        e164Pattern: e164Pattern
      }).then((did) => {
        return did.dids;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  cancelDids: (dids) => {
    return Voxbone.cancelDids(dids).then((response) => {
      return response;
    }).catch((err) => {
      throw new Error(err);
    })
  },
  listDidGroups(opts) {
    const pageNum = opts.pageNumber ? opts.pageNumber : '0';
    const pageSize = opts.pageSize ? opts.pageSize : '20';
    const type = opts.type ? opts.type : "GEOGRAPHIC";

    return Voxbone.listDidGroup({
        pageNumber: pageNum,
        pageSize: pageSize,
        countryCodeA3: opts.country,
        stateId: opts.state,
        cityNamePattern: opts.city,
        didType: type
      }).then((groups) => {
        if (groups) {
          return groups.didGroups;
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  },
  createCart: function(reference, description) {
    return Voxbone.createCart({
        customerReference: reference,
        description: description
      }).then(function(cart) {
        return cart.cart;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  addDIDToCart: function(cartId, didOrders) {
    return Voxbone.addToCart({
        cartIdentifier: cartId,
        didCartItem: didOrders
      }).then(function(order) {
        return order;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  checkoutCart: function(cartId) {
    return Voxbone.checkoutCart(cartId).then(function(cart) {
        return cart;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  listOrder: function(orderReference) {
    return Voxbone.listOrder({
        pageNumber: "0",
        pageSize: "2",
        reference: orderReference
      }).then(function(order) {
        return order;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
  getDidGroup: function(didGroupId, countryCodeA3) {
    return Voxbone.listDidGroup({
        pageNumber: "0",
        pageSize: "2",
        didGroupIds: [parseInt(didGroupId)],
        countryCodeA3: countryCodeA3
      }).then(function(dids) {
        return dids.didGroups;
      })
      .catch(function(err) {
        console.log(err);
        return err;
      });
  },
}