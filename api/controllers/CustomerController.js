'use strict';

module.exports = {
  /**
   * @api {get} /team/:id/tansactions
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */

  getTransactions: function(req, res) {
    var transformRequest = TransformerService.customer.get(req);

    var getTransactions = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(team) {

        if (team.billingId) {
          return Customer.getTransactions(team.billingId);
        } else {
          return res.ok({});
        }

      }).catch(function(err) {
        console.log('err', err);
      });
    };

    transformRequest
      .then(getTransactions)
      .then(TransformerService.customer.sendTransactions)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/tansactions
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */
  getInvoices: function(req, res) {
    var transformRequest = TransformerService.customer.get(req);

    var getInvoices = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(team) {

        if (team.billingId) {
          return Customer.getInvoices(team.billingId);
        } else {
          return res.ok({});
        }

      }).catch(function(err) {
        console.log('err', err);
      });
    };
    var filterInvoices = function(invoices) {
      if (req.param('start')) {
        var returnObj = [];
        invoices.forEach(function(invoice) {
          if (invoice.postedTimestamp >= req.param('start') && invoice.postedTimestamp <= req.param('end')) {
            returnObj.push(invoice);
          }
        })
        return returnObj;
      } else {
        return invoices;
      }
    };


    transformRequest
      .then(getInvoices)
      .then(filterInvoices)
      .then(TransformerService.customer.sendInvoices)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /invoicepdf/:id
   * @apiVersion 2.3.15
   * @apiName getInvoicePDF
   * @apiGroup Customer
   * @apiDescription returns a pdf of the invoice
   */
  getInvoicePDF: function(req, res) {
    Customer.getInvoicePDF(req.param('id')).then(function(data) {
        res.send(data.data)
      })
      .catch(res.generalError);
  },

  /**
   * @api {get} /draftinvoicepdf/:id
   * @apiVersion 2.3.15
   * @apiName getDraftInvoicePDF
   * @apiGroup Customer
   * @apiDescription returns a pdf of the invoice
   */
  getDraftInvoicePDF: function(req, res) {
    Customer.getDraftInvoicePDF(req.param('id')).then(function(data) {
        res.send(data.data)
      })
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/overview
   * @apiVersion 2.3.15
   * @apiName GetOverview
   * @apiGroup Customer
   * @apiDescription returns a overview of the customer
   */
  getOverview: function(req, res) {
    var transformRequest = TransformerService.customer.get(req);
    var teamId = null;
    var getCustomer = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(team) {
        teamId = team.id;
        if (team.billingId) {
          return Customer.overview(team.billingId);
        } else {
          return;
        }

      }).catch(function(err) {
        console.log('err', err);
      });
    };
    var getWallet = function(customer) {
      if (customer) {
        return TeamCredit.findOne({
          team: teamId
        }).then(function(credits) {
          customer.wallet = 0;
          if (credits) {
            customer.wallet = credits.amount;
          }
          return customer;
        }).catch(function(err) {
          console.log('err', err);
          return customer;
        });
      } else {
        return;
      }
    };
    var getProjectedInvoice = function(customer) {
      if (customer) {
        return Customer.listDraftInvoices(customer.id, "status:Projected").then(function(draftInvoices) {
          if (draftInvoices.length > 0) {
            customer.draft = draftInvoices[0];
          }
          return customer;
        }).catch(function(err) {
          console.log('err', err);
          return customer;
        });
      } else {
        return;
      }
    };

    transformRequest
      .then(getCustomer)
      .then(getWallet)
      .then(getProjectedInvoice)
      .then(TransformerService.customer.sendOverview)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /team/:id/addfunds/:card
   * @apiVersion 2.3.15
   * @apiName AddFunds
   * @apiGroup Customer
   * @apiParam {string} card The credit card id
   * @apiParam {string} amount The payment amount
   * @apiDescription Adds funds to the account
   */
  addFunds: function(req, res) {
    var transformRequest = TransformerService.customer.getPayment(req);
    var teamObj = null;
    var amount = Math.floor(req.body.amount);


    var buyCredits = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(team) {
        teamObj = team;
        return Customer.listProducts({
          query: "code:" + sails.config.billing.walletCode
        }).then(function(products) {
          if (products.length > 0) {
            return Customer.purchase({
              customerId: teamObj.billingId,
              productId: products[0].id,
              quantity: amount,
              name: products[0].name
            }).then(function(purchase) {
              if (purchase) {
                return Customer.finalizePurchase({
                  customerId: teamObj.billingId,
                  purchaseIds: [purchase.id]
                })
              }
            })
          }
        });
      }).catch(function(err) {
        console.log('err', err);
      });
    };

    var addFunds = function(purchase) {
      if (purchase) {
        return TeamCredit.find({
          team: teamObj.id
        }).then(function(teamCredit) {
          if (teamCredit.length > 0) {
            var promises = [];
            teamCredit.forEach(function(credit) {
              credit.amount += amount;
              var promise = TeamCredit.update({
                id: credit.id
              }, {
                amount: credit.amount
              })
              promises.push(promise);
            })
            return Promise.all(promises).then(function(result) {
              return result[0];
            });
          }
        }).catch(function(err) {
          console.log('err', err);
        });
      }
    };

    transformRequest
      .then(buyCredits)
      .then(addFunds)
      .then(TransformerService.charge.sendCredits)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/subscriptions
   * @apiVersion 2.3.15
   * @apiName ListSubscriptions
   * @apiGroup Customer
   * @apiDescription returns a list of subscriptions
   */
  listSubscriptions: function(req, res) {
    var transformRequest = TransformerService.customer.get(req);

    var getSubscriptions = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(team) {

        if (team.billingId) {
          return Subscription.listSubscriptions(team.billingId);
        } else {
          return;
        }

      }).catch(function(err) {
        console.log('err', err);
      });
    };

    transformRequest
      .then(getSubscriptions)
      .then(TransformerService.customer.sendSubscriptions)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /team/:id/billingaddress
   * @apiVersion 2.3.15
   * @apiName updateAddress
   * @apiGroup Customer
   * @apiDescription updates a billing address to fusebill
   */
  updateAddress: function(req, res) {
    var transformRequest = TransformerService.customer.getAddress(req);
    var team = null;

    var getTeam = function() {
      return Team.findOne({
        id: req.param('id')
      })
    };
    var getAddress = function(result) {
      return Customer.getAddress(result.billingId).then(function(address) {
        team = result;
        if (address && address.billingAddress) {
          return updateAddress(address.billingAddress.id);
        } else {
          return addAddress(result);
        }
      })
    };

    var addAddress = function(team) {
      var address = {
        "customerAddressPreferenceId": team.billingId,
        "countryId": req.body.countryId,
        "stateId": req.body.stateId,
        "enforceFullAddress": true,
        "companyName": team.name,
        "line1": req.body.address1,
        "line2": req.body.address2,
        "city": req.body.city,
        "postalZip": req.body.postalZip,
        "addressType": "Billing"
      }
      return Customer.addAddress(address).then(function(address) {
          return address;
        })

        .catch(function(err) {
          console.log('err', err);
        });
    };

    var updateAddress = function(addressId) {
      var address = {
        "id": addressId,
        "customerAddressPreferenceId": team.billingId,
        "countryId": req.body.countryId,
        "stateId": req.body.stateId,
        "enforceFullAddress": true,
        "companyName": team.name,
        "line1": req.body.address1,
        "line2": req.body.address2,
        "city": req.body.city,
        "postalZip": req.body.postalZip,
        "addressType": "Billing"
      }
      return Customer.updateAddress(address).then(function(address) {
          return address;
        })

        .catch(function(err) {
          console.log('err', err);
        });
    };

    transformRequest
      .then(getTeam)
      .then(getAddress)
      .then(TransformerService.customer.sendAddress)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
}