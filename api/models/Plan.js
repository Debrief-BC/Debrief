'use strict';

/**
 * Plan.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Fusebill = require('fusebill-node')(sails.config.billing.apiKey);
Fusebill.setHost(sails.config.billing.host);

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    code: {
      type: 'string',
      required: true
    },
    price: {
      type: 'string',
      required: true
    },
    country: {
      type: 'string',
      required: true
    },
    defaultPlan: {
      type: 'boolean',
      required: true
    },
    fusebillId: {
      type: 'integer'
    },
    teams: {
      collection: 'team',
      via: 'plan'
    },
    deletedAt: {
      type: 'datetime'
    },
    currency: {
      model: 'currency'
    },
  },
  defaultPopulate: ['currency'],
  list: function() {
    return Fusebill.plans.list({
      code: this.code
    }).then(function(r) {
      return r;
    });
  },
  retrieve: function(id) {
    return Fusebill.plans.retrieve(id)
      .then(function(r) {
        return r;
      })
      .catch(function(e) {
        return e;
      });
  },
  frequencyId: function(code) {
    return this.list().then(function(plans) {
      for (var i = 0; i < plans.length; i++) {
        if (plans[i].code == code) {
          for (var j = 0; j < plans[i].planFrequencies.length; j++) {
            if (plans[i].planFrequencies[j].interval === "Monthly") {
              return plans[i].planFrequencies[j].id;
            }
          }
        }
      }
      return plans;
    }).catch(function(e) {
      sails.log(e);
    });
  },
  updateBilling: function(plan, teamUser, existingPlan) {
    var team = null;
    var getTeam = function() {
      return Team.findOne({
        id: teamUser.team
      }).then(function(result) {
        team = result;
        return plan;
      })
    }
    var getPlan = function(planId) {
      return Plan.findOne({
        id: planId
      })
    }
    var getSubscriptions = function(plan) {
      if (team.activated === "active") {
        //Get all customer subscriptions
        return Subscription.listSubscriptions(team.billingId, {
          query: "status:Active"
        }).then(function(subscriptions) {
          var existingSub = _.pluck(subscriptions, 'planCode');
          var index = _.indexOf(existingSub, plan.code);
          //Check if subscription exists if not add subscription to fusebill customer else update quantity
          if (index === -1) {
            return Plan.subscribePlan(plan, teamUser, team).then(function() {
              //Update old plan quantity
              return getPlan(existingPlan).then(function(plan) {
                var index = _.indexOf(existingSub, plan.code);
                subscriptions[index].subscriptionProducts[0].quantity--;
                if (subscriptions[index].subscriptionProducts[0].quantity <= 0) {
                  return Subscription.cancel({
                    subscriptionId: subscriptions[index].id,
                    cancellationOption: "None"
                  });
                } else {
                  return Subscription.updateSubscription(subscriptions[index]);
                }
              });
            })
          } else {
            return updateQuantity(subscriptions, index, existingSub)
          }
        });
      } else {
        return;
      }
    }
    var updateQuantity = function(subscriptions, newIndex, existingSub) {
      //Update new plan quantity
      subscriptions[newIndex].subscriptionProducts[0].quantity++;
      return Subscription.updateSubscription(subscriptions[newIndex]).then(function(updated) {
        //Update old plan quantity
        return getPlan(existingPlan).then(function(plan) {
          var index = _.indexOf(existingSub, plan.code);
          subscriptions[index].subscriptionProducts[0].quantity--;
          if (subscriptions[index].subscriptionProducts[0].quantity <= 0) {
            return Subscription.cancel({
              subscriptionId: subscriptions[index].id,
              cancellationOption: "None"
            });
          } else {
            return Subscription.updateSubscription(subscriptions[index]);
          }
        });
      })
    }
    getTeam()
      .then(getPlan)
      .then(getSubscriptions)
  },
  subscribePlan: function(plan, teamUser, team) {
    return Customer.listPlans({
      query: "code:" + plan.code
    }).then(function(availablePlans) {
      var frequencys = _.pluck(availablePlans[0].planFrequencies, 'interval');
      //Default Monthly frequency
      var index = _.indexOf(frequencys, "Monthly");
      var subscription = {
        customerId: team.billingId,
        code: plan.code,
        name: plan.name,
        planFrequencyId: availablePlans[0].planFrequencies[index].id
      };
      return Subscription.create(subscription).then(function(subscription) {
        if (team.activated === "pending") {
          return Subscription.activate(subscription.id, false, true);
        } else {
          return Subscription.activate(subscription.id);
        }
      });
    });
  }
};