'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      "start": {
        key: 'start'
      },
      "end": {
        key: 'end'
      },
    });
  },
  getPayment: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      "card": {
        key: 'card'
      },
      "amount": {
        key: 'amount'
      },
    });
  },
  sendTransactions: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Customer.idToPid
      },
      "effectiveTimestamp": {
        key: 'effectiveTimestamp'
      },
      "transactionType": {
        key: 'transactionType'
      },
      "name": {
        key: 'name'
      },
      "description": {
        key: 'description'
      },
      "productCode": {
        key: 'productCode'
      },
      "paymentActivityId": {
        key: 'paymentActivityId'
      },
      "reference": {
        key: 'reference'
      },
      "quantity": {
        key: 'quantity'
      },
      "unitPrice": {
        key: 'unitPrice'
      },
      "arDebit": {
        key: 'arDebit'
      },
      "arCredit": {
        key: 'arCredit'
      },
      "glCode": {
        key: 'glCode'
      },
      "invoiceAllocations": {
        key: 'invoiceAllocations',
        value: TransformerService.customer.sendInvoices
      },
      "associatedId": {
        key: 'associatedId'
      }
    });
  },
  sendInvoices: function(data) {
    return Transformer.build(data, {

      "id": {
        key: 'id'
      },
      "invoiceNumber": {
        key: 'invoiceNumber'
      },
      "postedTimestamp": {
        key: 'postedTimestamp'
      },
      "invoiceAmount": {
        key: 'invoiceAmount'
      },
      "paymentSchedules": {
        key: 'status',
        value: function(paymentSchedules) {
          if (paymentSchedules.length > 0) {
            return paymentSchedules[0].status;
          }
        }
      }

    });
  },
  sendOverview: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Customer.idToPid
      },
      "status": {
        key: 'status'
      },
      "customerAccountStatus": {
        key: 'customerAccountStatus'
      },
      "pendingCharges": {
        key: 'pendingCharges'
      },
      "arBalance": {
        key: 'arBalance',
        value: function(balance) {
          return balance * -1;
        }
      },
      "unallocatedPayments": {
        key: 'unallocatedPayments'
      },
      "unallocatedCredits": {
        key: 'unallocatedCredits'
      },
      "unallocatedOpeningBalance": {
        key: 'unallocatedOpeningBalance'
      },
      "currency": {
        key: 'currency'
      },
      "daysUntilSuspension": {
        key: 'daysUntilSuspension'
      },
      "monthlyRecurringRevenue": {
        key: 'monthlyRecurringRevenue'
      },
      "nextBillingDate": {
        key: 'nextBillingDate'
      },
      "wallet": {
        key: 'wallet',
        value: TransformerService.charge.sendCredits
      },
      "draft": {
        key: 'draft'
      },
    });
  },
  getSubscription: function(req) {

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'coupon_code': {
        key: 'couponCode'
      }
    });
  },
  sendSubscriptions: function(data) {
    return Transformer.build(data, {
      "planFrequency": {
        key: 'planFrequency'
      },
      "planCode": {
        key: 'planCode'
      },
      "planName": {
        key: 'planName'
      },
      "planDescription": {
        key: 'planDescription'
      },
      "status": {
        key: 'status'
      },
      "subscriptionProducts": {
        key: 'subscriptionProducts',
        value: TransformerService.customer.sendSubscriptionProducts
      },
      "amount": {
        key: 'amount'
      },
    });
  },
  sendSubscriptionProducts: function(data) {
    return Transformer.build(data, {
      "id": {
        key: 'id'
      },
      "quantity": {
        key: 'quantity'
      },
      "monthlyRecurringRevenue": {
        key: 'monthlyRecurringRevenue'
      },
      "status": {
        key: 'status'
      },
    });
  },
  sendSubscription: function(data) {
    return Transformer.build(data, {
      'planCode': {
        key: 'plan_code'
      },
      'planName': {
        key: 'plan_name'
      },
      'status': {
        key: 'status'
      },
      'invoicePreview': {
        key: 'invoice_preview',
        value: TransformerService.customer.sendPreviewInvoice
      },
    });
  },
  sendPreviewInvoice: function(data) {
    return Transformer.build(data, {
      'subtotal': {
        key: 'subtotal'
      },
      'total': {
        key: 'total'
      },
      'totalTaxes': {
        key: 'taxes'
      },
      'draftCharges': {
        key: 'draft_charges',
        value: TransformerService.customer.sendCharges
      },
    });
  },
  sendCharges: function(data) {
    return Transformer.build(data, {
      'quantity': {
        key: 'quantity'
      },
      'unitPrice': {
        key: 'unit_price'
      },
      'amount': {
        key: 'non_discounted_amount'
      },
      'draftDiscount': {
        key: 'draft_discount',
        value: TransformerService.customer.sendDiscount
      },
    });
  },
  sendDiscount: function(data) {
    return Transformer.build(data, {
      'amount': {
        key: 'discounted_amount'
      },
      'configuredDiscountAmount': {
        key: 'discount'
      },
      'discountType': {
        key: 'discount_type'
      },
    });
  },

  getAddress: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      "country_id": {
        key: 'countryId'
      },
      "state_id": {
        key: 'stateId'
      },
      "address1": {
        key: 'address1'
      },
      "address2": {
        key: 'address2'
      },
      "city": {
        key: 'city'
      },
      "postal_zip": {
        key: 'postalZip'
      },
    });
  },

  sendAddress: function(req) {
    return Transformer.buildGet(req, {
      "countryId": {
        key: 'country_id'
      },
      "stateId": {
        key: 'state_id'
      },
      "address1": {
        key: 'address1'
      },
      "address2": {
        key: 'address2'
      },
      "city": {
        key: 'city'
      },
      "postalZip": {
        key: 'postal_zip'
      },
    });
  },
};