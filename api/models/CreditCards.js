'use strict';

const Fusebill = require('fusebill-node')(sails.config.billing.apiKey);
Fusebill.setHost(sails.config.billing.host);

module.exports = {
  find: function(id) {
    return Fusebill.customers.listCreditCards(id).then(function(cards) {
      return cards;
    });
  },
  findOne: function(id) {
    return Fusebill.paymentMethods.retrieve({
      customerId: id
    });
  },
  update: function() {
    return;
  },
  delete: function(id) {
    return Fusebill.paymentMethods.del(id);
  },
  getDefault: function(customerId) {
    return this.find(customerId).then(function(cards) {
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].isDefault) {
          return cards[i];
        }
      }
    }).catch(function(e) {
      console.log(e);
    });
  },
  setDefault: function(id) {
    return Fusebill.paymentMethods.setPaymentMethodDefault(id, "CreditCard");
  },
  getCountries: function() {
    return Fusebill.countries.list();
  }
};