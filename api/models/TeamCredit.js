'use strict';

module.exports = {
  tableName: 'team_credit',
  attributes: {
    team: {
      model: 'team'
    },
    amount: {
      type: 'float'
    },
    provider: {
      type: 'string'
    },
    direction: {
      type: 'string'
    },
    prefix: {
      type: 'string'
    },
  },
  defaultFilter: ['provider', 'direction', 'prefix', 'amount', 'team'],
  defaultPopulate: ['team'],

  afterUpdate: function(updated, cb, old) {
    cb();
    var teamObj = null;
    var amount = null;
    var buyCredits = function(id) {
      return Team.findOne({
        id: id
      }).then(function(team) {
        teamObj = team;
        return Customer.listProducts({
          query: "code:" + sails.config.billing.walletCode
        }).then(function(products) {
          if (products.length > 0) {
            return Customer.purchase({
              customerId: team.billingId,
              productId: products[0].id,
              quantity: amount,
              name: products[0].name
            }).then(function(purchase) {
              if (purchase) {
                return Customer.finalizePurchase({
                  customerId: team.billingId,
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
            return Promise.all(promises);
          }
        }).catch(function(err) {
          console.log('err', err);
        });
      }
    };
    TeamWallet.findOne({
      team: updated.team
    }).then(function(wallet) {
      if (wallet.auto_refill) {
        if (updated.amount < wallet.refill_point) {
          amount = (wallet.refill_point + wallet.refill_amount) - updated.amount;
          return buyCredits(updated.team).then(addFunds);
        } else {
          return;
        }
      }
      if (wallet.notifications) {
        if (updated.amount < wallet.threshold) {
          return Team.updateAndPublish({
            id: updated.team
          }, {
            wallet: true
          })
        } else {
          return Team.updateAndPublish({
            id: updated.team
          }, {
            wallet: false
          })
        }
      }
    })


  },
}