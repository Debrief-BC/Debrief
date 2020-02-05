'use strict';

var Fusebill = require('fusebill-node')(sails.config.billing.apiKey);
Fusebill.setHost(sails.config.billing.host);

module.exports = {
  find: function() {
    return Fusebill.customers.list();
  },
  findOne: function(id) {
    return Fusebill.customers.retrieve(id);
  },
  create: function(customer) {
    return Fusebill.customers.create(customer);
  },
  update: function(customer) {
    return Fusebill.customers.update(customer);
  },
  destroy: function(id) {
    return Fusebill.customers.del(id);
  },
  activate: function(customerId, activate) {
    return Fusebill.customerActivation.activate({
      customerId: customerId
    })
  },
  cancel: function() {
    return;
  },
  uncancel: function() {
    return;
  },
  getTransactions: function(id) {
    return Fusebill.customers.listTransactions(id)
  },
  getInvoices: function(id) {
    return Fusebill.customers.listInvoices(id)
  },
  getInvoicePDF: function(invoiceId) {
    return Fusebill.invoices.retrievePdf(invoiceId)
  },
  overview: function(id) {
    return Fusebill.customers.overview(id)
  },
  payment: function(payment) {
    return Fusebill.payments.create(payment)
  },
  listProducts: function(query) {
    return Fusebill.products.list(query)
  },
  purchase: function(purchase) {
    return Fusebill.purchases.create(purchase)
  },
  finalizePurchase: function(purchase) {
    return Fusebill.purchases.finalize(purchase)
  },
  listPlans: function(query) {
    return Fusebill.plans.list(query)
  },
  listDraftInvoices: function(id, query) {
    if (query) {
      return Fusebill.customers.listDraftInvoices(id, query)
    } else {
      return Fusebill.customers.listDraftInvoices(id)
    }
  },
  activateDraftInvoice: function(draftInvoiceId) {
    return Fusebill.invoices.activateDraftInvoice(draftInvoiceId)
  },
  getDraftInvoicePDF: function(invoiceId) {
    return Fusebill.draftInvoices.retrievePdf(invoiceId)
  },
  addAddress: function(address) {
    return Fusebill.addresses.create(address)
  },
  updateAddress: function(address) {
    return Fusebill.addresses.update(address)
  },
  getAddress: function(id) {
    return Fusebill.customerAddressPreferences.retrieve(id)
  },
};