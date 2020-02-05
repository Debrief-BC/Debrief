'use strict';

module.exports = {
  /**
   * @api {get} /didnumber
   * @apiVersion 2.3.15
   * @apiName GetDidNumbers
   * @apiGroup DidNumber
   *
   * @apiDescription This gets all did numbers visible to the current user
   * @apiSuccess {DidNumber[]} body a list the did numbers
   */
  find(req, res) {
    let TransformRequest = TransformerService.didnumber.get(req);

    let findnum = () => {
      let findQuery = {
        find: {
          team: req.param('id')
        }
      };

      if (req.isSuperAdmin && !req.param('id')) {
        return DidNumber.filter.find(req);
      }

      return DidNumber.filter.find(req, findQuery);
    };

    return TransformRequest
      .then(findnum)
      .then(TransformerService.didnumber.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /didnumber/:id
   * @apiVersion 2.3.15
   * @apiName GetDidNumber
   * @apiGroup DidNumber
   *
   * @apiDescription This gets a specific did number
   */
  findOne(req, res) {
    let TransformRequest = TransformerService.didnumber.get(req);

    let findnum = () => {
      let findQuery = {
        find: {
          team: req.param('id')
        }
      };

      return DidNumber.filter.findOne(req, findQuery);
    };

    return TransformRequest
      .then(findnum)
      .then(TransformerService.didnumber.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  findOneByNumber(req, res) {
    let TransformRequest = TransformerService.didnumber.getByNumber(req);

    let findnum = () => {
      return DidNumber.filter.find(req).then(function(result) {
        if (!result) return null;
        return result[0];
      });
    };

    return TransformRequest
      .then(findnum)
      .then(TransformerService.didnumber.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /didnumber
   * @apiVersion 2.3.15
   * @apiName CreateDidNumber
   * @apiGroup DidNumber
   *
   * @apiDescription This creates a specific did number
   */
  create(req, res) {
    let validate = ValidatorService.didnumber.validateCreate(req.body);
    let transformRequest = () => {
      return TransformerService.didnumber.get(req);
    };
    let createDidNumber = () => {
      return DidNumber.createAndPublish(req.body, req);
    }

    validate
      .then(transformRequest)
      .then(createDidNumber)
      .then(TransformerService.didnumber.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /didnumber/:id
   * @apiVersion 2.3.15
   * @apiName EditDidNumber
   * @apiGroup DidNumber
   *
   * @apiDescription This edits a specific did number
   */
  edit(req, res) {
    let validate = ValidatorService.didnumber.validateEdit(req.body);

    let createDidNumber = () => {
      return DidNumber.updateAndPublish(req.param('id'), req.body, req);
    }

    TransformerService.didnumber.get(req)
      .then(validate)
      .then(createDidNumber)
      .then(TransformerService.didnumber.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /didnumber/:id
   * @apiVersion 2.3.15
   * @apiName DeleteDidNumber
   * @apiGroup DidNumber
   *
   * @apiDescription This deletes a specific did number
   */
  destroy(req, res) {
    const deleteVoxboneDid = () => {

      // In order to delete a did number, we first must find its id, as this
      // is not something we store in our db

      // Start by finding the did we are trying to cancel
      return DidNumber.findOne({
        id: req.param('id')
      }).then((did) => {

        // Once we get the did, we will have its number
        // We use the did number to search the dids we have on Voxbone
        // using the e164Pattern param
        return DidNumber.listDids(null, '%25' + did.number).then((response) => {

          // Make sure we get a number back, if not, the number has already been
          // canceled
          if (response && response.length > 0) {

            // Cancel the did number
            return DidNumber.cancelDids([response[0].didId]).then((cancelResponse) => {
              return cancelResponse;
            }).catch((err) => {
              throw new Error(err);
            });
          } else {
            // throw a 404, the number was not found or already deleted
            return;
          }
        });

      }).catch((e) => {
        throw new Error(e);
      });
    };

    const deleteDid = () => {
      return DidNumber.destroyAndPublish({
        id: req.param('id')
      }, req);
    };

    return TransformerService.didnumber.get(req)
      .then(deleteVoxboneDid)
      .then(deleteDid)
      .then(res.okOrNotFound)
      .catch(res.generalError)
  },
  /**
   * @api {get} /didnumber/countries
   * @apiVersion 2.3.15
   * @apiName listCountries
   * @apiGroup DidNumber
   * @apiDescription returns a list countries available on Voxbone
   * @apiParam {string} [pageNumber] pagination element for which page
   * @apiParam {string} [pageSize] pagination element for number of values per page
   */

  listCountries(req, res) {
    let getCountries = () => {
      let options = {
        pageNumber: req.param("pageNumber") ? req.param("pageNumber") : "0",
        pageSize: req.param("pageSize") ? req.param("pageSize") : "10"
      }
      return DidNumber.listCountries(options);
    };

    getCountries()
      .then(TransformerService.didnumber.sendCountries)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /didnumber/:country/states
   * @apiVersion 2.3.15
   * @apiName listStates
   * @apiGroup DidNumber
   * @apiDescription returns a list of states on Voxbone for given country
   */

  listStates(req, res) {
    let validate = ValidatorService.didnumber.validateState(req);
    let getStates = () => {
      return DidNumber.listStates(req.param('country'));
    };

    validate
      .then(getStates)
      .then(TransformerService.didnumber.sendStates)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /didnumber/:country/cities
   * @apiVersion 2.3.15
   * @apiName listcities
   * @apiGroup DidNumber
   * @apiDescription returns a list of cities on Voxbone for given country
   * @apiParam {string} [pageNumber] pagination element for which page
   * @apiParam {string} [pageSize] pagination element for number of values per page
   * @apiParam {string} [state] the state id
   */

  listCities(req, res) {
    let validate = ValidatorService.didnumber.validateState(req);
    let getCities = () => {
      let options = {
        pageNumber: req.param("pageNumber") ? req.param("pageNumber") : "0",
        pageSize: req.param("pageSize") ? req.param("pageSize") : "1000",
        country: req.param('country')
      }
      if (req.param('state')) options.state = req.param('state');
      if (req.param('type')) options.type = req.param('type');
      return DidNumber.listDidGroups(options);
    };

    validate
      .then(getCities)
      .then(TransformerService.didnumber.sendCities)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /team/:id/autoreception
   * @apiVersion 2.3.15
   * @apiName createAutoreception
   * @apiGroup DidNumber
   * @apiDescription Orders a DID, creates and links a voiceURI to the DID, adds the did to table
   * @apiParam id The team's unique id.
   *
   * @apiParam the didGroupId retrieved upon selecting a city
   */

  createAutoreception(req, res) {
    let validate = ValidatorService.didnumber.validateCreate(req);
    let transformRequest = () => {
      return TransformerService.didnumber.getAutoreception(req);
    };
    let didNumber = null;
    let team = null;
    let getTeam = () => {
      return Team.findOne({
        id: req.param('id')
      }).then(function(result) {
        team = result;
        if (team.autoreception === 'completed') {
          res.forbidden("Autoreception can only be set up once");
        }
        return result
      });
    };
    let createCart = function(team) {
      return DidNumber.createCart(team.name, "Autoreception DID Order");
    };
    let orderDID = function(cart) {
      let didOrder = {
        "didGroupId": req.param("didGroupId"),
        "quantity": "1"
      };
      return DidNumber.addDIDToCart(cart.cartIdentifier, didOrder).then(function(item) {
        if (item.status === "SUCCESS") {
          return DidNumber.checkoutCart(cart.cartIdentifier);
        }
      });
    };
    let checkOrder = function(cart) {
      if (cart.status === "SUCCESS") {
        return DidNumber.listOrder(cart.productCheckoutList[0].orderReference).then(function(order) {
          return DidNumber.listDids(cart.productCheckoutList[0].orderReference);
        });
      }
    };
    let createVoiceURI = function(dids) {
      didNumber = dids[0].e164.replace(/^\+/, '');
      return DidNumber.createVoiceURI(didNumber + "@" + sails.config.autoreception.uri, didNumber + "@" + sails.config.autoreception.uri + " to " + team.name + " Autoreception").then(function(voiceURI) {
        return DidNumber.applyConfiguration(dids[0].didId, voiceURI.voiceUriId);
      });
    };
    let createCallRoute = function(voiceURI) {
      return CallRoute.createAutoreceptionRoute("Autoreception", req.param('id'), 100);
    }
    let createDidNumber = function(callRoute) {
      return DidNumber.createAndPublish({
        name: team.name + " Main",
        number: didNumber,
        team: req.param('id'),
        call_route: callRoute.id
      });
    };

    validate
      .then(transformRequest)
      .then(getTeam)
      .then(createCart)
      .then(orderDID)
      .then(checkOrder)
      .then(createVoiceURI)
      .then(createCallRoute)
      .then(createDidNumber)
      .then(TransformerService.didnumber.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
  /**
   * @api {get} /didnumber/globalnumbers
   * @apiVersion 2.3.15
   * @apiName getGlobalConferenceNumbers
   * @apiGroup DidNumber
   * @apiDescription returns a list of the global conference numbers
   */

  getGlobalConferenceNumbers(req, res) {
    let getNumbers = function() {
      return new Promise(function(resolve, reject) {
        let response = sails.config.globalConference;
        return resolve(response);
      });
    };

    getNumbers()
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /didnumber/prices
   * @apiVersion 2.3.15
   * @apiName listNumberPrices
   * @apiGroup DidNumber
   * @apiDescription returns a list countries available for buying a number and the setup and monthly price for each
   */

  listNumberPrices(req, res) {
    let getNumbers = function() {
      return NumberRate.find()
    };

    getNumbers()
      .then(TransformerService.didnumber.sendNumberPrices)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /team/:id/buynumber
   * @apiVersion 2.3.15
   * @apiName buyNumber
   * @apiGroup DidNumber
   * @apiDescription Orders a DID, creates and links a voiceURI to the DID, adds the did to table and charges the teams credit card
   * @apiParam id The team's unique id.
   *
   * @apiParam the didGroupId retrieved upon selecting a city
   */

  buyNumber(req, res) {
    let validate = ValidatorService.didnumber.validateCreate(req);
    let transformRequest = function() {
      return TransformerService.didnumber.getBuyNumber(req);
    };
    let didNumber = null;
    let team = null;
    let rate = null;

    let getTeam = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(result) {
        team = result;
        return result
      });
    };
    let checkCreditCard = (team) => {
      return new Promise((resolve, reject) => {
        return CreditCards.getDefault(team.billingId).then((card) => {
          if (!card) {
            reject({
              credit_card: "A credit card is required to subscribe team"
            });
          } else {
            resolve(team);
          }
        });
      });
    };

    let getDidInfo = (team) => {
      return new Promise((resolve, reject) => {
        let blockedCountries = sails.config.blockedCountries;

        if (blockedCountries.includes(req.param("country"))) {
          return reject({
            number: "This number is not allowed purchasing"
          });
        } else {
          return DidNumber.getDidGroup(req.param("didGroupId"), req.param("country")).then((did) => {
            if (did.length > 0 && did[0].stock > 0) {
              return NumberRate.findOne({
                type: did[0].didType,
                code: did[0].countryCodeA3
              }).then((result) => {
                rate = result;
                resolve(team);
              })
            } else {
              reject({
                number: "This number is not available"
              });
            }
          })
        }
      })
    };

    let chargeSetupFee = (team) => {
      return new Promise((resolve, reject) => {
        return Customer.listProducts({
          query: "code:" + rate.setup_code
        }).then((products) => {
          if (products.length > 0) {
            return Customer.purchase({
              customerId: team.billingId,
              productId: products[0].id,
              quantity: 1,
              name: products[0].name
            }).then((purchase) => {
              if (purchase) {
                return Customer.finalizePurchase({
                  customerId: team.billingId,
                  purchaseIds: [purchase.id]
                }).then((result) => {
                  resolve(result);
                })
              }
            })
          } else {
            reject({
              number: "This number is not available"
            });
          }
        });
      });
    };

    let subscribePlan = () => {
      let code = sails.config.billing.geographicMonthlyCode;
      if (rate.type === "TOLL_FREE") code = sails.config.billing.tollFreeMonthlyCode;
      return Customer.listPlans({
        query: "code:" + code
      }).then(function(availablePlans) {
        let frequencys = _.pluck(availablePlans[0].planFrequencies, 'interval');
        //Default Monthly frequency
        let index = _.indexOf(frequencys, "Monthly");
        let subscription = {
          customerId: team.billingId,
          code: availablePlans[0].code,
          name: availablePlans[0].name,
          planFrequencyId: availablePlans[0].planFrequencies[index].id
        };
        return Subscription.create(subscription).then((subscription) => {
          return Subscription.activate(subscription.id);
        });
      });
    };

    let addProduct = (subscription) => {
      let products = _.pluck(subscription.subscriptionProducts, 'planProduct');
      products = _.pluck(products, 'productCode');
      let index = _.indexOf(products, rate.monthly_code);
      subscription.subscriptionProducts[index].isIncluded = true;
      if (req.body.couponCode) {
        return Subscription.updateSubscription(subscription).then(function(subscription) {
          return Subscription.applyCoupon(subscription.id, req.body.couponCode)
        });
      } else {
        return Subscription.updateSubscription(subscription)
      }
    };

    let createCart = () => {
      return DidNumber.createCart(team.name, "Autoreception DID Order");
    };

    let orderDID = (cart) => {
      let didOrder = {
        "didGroupId": req.param("didGroupId"),
        "quantity": "1"
      };
      return DidNumber.addDIDToCart(cart.cartIdentifier, didOrder).then(function(item) {
        if (item.status === "SUCCESS") {
          return DidNumber.checkoutCart(cart.cartIdentifier);
        }
      });
    };

    let checkOrder = (cart) => {
      if (cart.status === "SUCCESS") {
        return DidNumber.listOrder(cart.productCheckoutList[0].orderReference).then(function(order) {
          return DidNumber.listDids(cart.productCheckoutList[0].orderReference);
        });
      }
    };
    let createVoiceURI = (dids) => {
      didNumber = dids[0].e164.replace(/^\+/, '');
      return DidNumber.createVoiceURI(didNumber + "@" + sails.config.autoreception.uri, didNumber + "@" + sails.config.autoreception.uri + " to " + team.name).then(function(voiceURI) {
        return DidNumber.applyConfiguration(dids[0].didId, voiceURI.voiceUriId);
      });
    };
    let createDidNumber = (did) => {
      return DidNumber.createAndPublish({
        name: team.name + " number",
        number: didNumber,
        team: req.param('id')
      });
    };

    validate
      .then(transformRequest)
      .then(getTeam)
      .then(checkCreditCard)
      .then(getDidInfo)
      .then(chargeSetupFee)
      .then(subscribePlan)
      .then(addProduct)
      .then(createCart)
      .then(orderDID)
      .then(checkOrder)
      .then(createVoiceURI)
      .then(createDidNumber)
      .then(TransformerService.didnumber.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
}