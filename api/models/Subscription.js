'use strict';

var Fusebill = require('fusebill-node')(sails.config.billing.apiKey);
Fusebill.setHost(sails.config.billing.host);

module.exports = {
  find: function() {
    return Fusebill.subscriptions.list();
  },
  findOne: function(id) {
    return Fusebill.subscriptions.retrieve(id);
  },
  create: function(subscription) {
    return Fusebill.subscriptions.create(subscription);
  },
  update: function(subscription) {
    return Fusebill.subscriptions.update(subscription);
  },
  destroy: function(subscriptionId) {
    return Fusebill.subscriptions.del(subscriptionId);
  },
  activate: function(id, preview, autopost) {
    if (preview || autopost) {
      return Fusebill.subscriptionActivation.activate(id, preview, autopost)
    } else {
      return Fusebill.subscriptionActivation.activate(id)
    }
  },
  cancel: function(options) {
    return Fusebill.subscriptionCancellation.cancel(options);
  },
  makePayment: function(payment) {
    return Fusebill.payments.create(payment);
  },
  listSubscriptions: function(id, query) {
    if (query) {
      return Fusebill.customers.listSubscriptions(id, query)
    } else {
      return Fusebill.customers.listSubscriptions(id)
    }
  },
  updateSubscription: function(subscription) {
    return Fusebill.subscriptions.update(subscription)
  },
  updateSubscriptionDisabled: function(subscription) {
    return Fusebill.subscriptions.updateDisabled(subscription)
  },
  validateCoupon: function(couponCode) {
    return Fusebill.coupons.validate({
      couponCode: couponCode
    })
  },
  applyCoupon: function(subscriptionId, couponCode) {
    return Fusebill.subscriptionCoupons.apply({
      subscriptionId: subscriptionId,
      couponCode: couponCode
    })
  },
  listCoupons: function() {
    return Fusebill.coupons.list()
  },
  getCoupon: function(id) {
    return Fusebill.coupons.retrieve(id)
  },
};