'use strict';

module.exports = {
  /**
   * @api {post} /charge
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName Charge
   * @apiGroup Charge
   *
   * @apiDescription Create a charge for PBX billing
   * @apiSuccess {ChannelEvents[]} body an array of the channel events
   */
  charge: function(req, res) {
    var transformReq = function() {
      return TransformerService.charge.get(req);
    };
    var prefix_selector = "";
    var order_selector = "char_length(prefix) desc";

    var checkAuthorization = function() {
      if (!req.isFreeswitch) throw {
        errorType: 'authorization',
        response: 'only freeswitch may issue charges'
      };
    }

    var buildPrefixSelector = function() {
      var pstn_number = req.param('pstn_number');
      prefix_selector = "(";
      while (pstn_number.length > 0) {
        prefix_selector += 'prefix = "' + pstn_number + '" or ';
        pstn_number = pstn_number.slice(0, -1);
      }
      prefix_selector += "prefix is null)";
      if (req.param('provider')) {
        prefix_selector += " and (provider = '" + req.param('provider') + "' or provider is null)";
        order_selector += ", char_length(provider) desc";
      }

      if (req.param('direction')) {
        prefix_selector += " and (direction = '" + req.param('direction') + "' or direction = 'both')";
        order_selector += ", char_length(direction) desc"
      }
    }

    var findRate = function() {
      return CallRate.rawQuery('SELECT * FROM call_rate WHERE ' + prefix_selector + ' ORDER BY ' + order_selector + ';')
        .then(function(rates) {
          if (rates.length == 0) throw "Rates not set";
          if (rates[0].rate === null) throw "Blocked Area Code";
          return rates[0];
        });
    }

    var findWallets = function(rate) {
      if (rate.rate == 0) {
        var obj = {
          rate: 0
        };
        return obj;
      }
      return TeamCredit.rawQuery('SELECT * FROM team_credit WHERE team = ' + req.param('team') + ' and amount > 0 and ' + prefix_selector + '  ORDER BY ' + order_selector + ';')
        .then(function(wallets) {
          if (wallets.length == 0) throw "Team has no wallets";
          return {
            rate: rate,
            wallets: wallets
          };
        });
    }

    var chargeWallets = function(chargeObj) {
      if (chargeObj.rate == 0) {
        chargeObj.response = {
          amount: 0
        };
        chargeObj.wallets = [];
        return chargeObj;
      }
      var charge_amount = chargeObj.rate.rate * (req.param('tick_length') / 60);
      var query = 'UPDATE team_credit SET amount = amount - ' + charge_amount + ' where team = ' + chargeObj.wallets[0].team + ';';
      return TeamCredit.rawQuery(query)
        .then(function(res) {
          return TeamCredit.rawQuery('SELECT * from team_credit WHERE id = ' + chargeObj.wallets[0].id + ';');
        })
        .then(function(response) {
          chargeObj.response = response[0] || null;
          chargeObj.charge_amount = charge_amount;
          return chargeObj;
        });
    }

    var processResult = function(chargeObj) {
      var rtn_obj = {
        billing_succeeded: chargeObj.response.amount > 0,
        billed_duration: req.param('tick_length') + (req.param('billed_duration') || 0),
        session_uuid: req.param('session_uuid'),
        tick_length: req.param('tick_length'),
        low_funds: chargeObj.response.amount < 10 && chargeObj.wallets.length == 1,
        stop_call: chargeObj.response.amount <= 0 && chargeObj.wallets.length == 1,
        charge_amount: chargeObj.charge_amount,
        rate: chargeObj.rate.rate || chargeObj.rate
      };

      return rtn_obj;
    };

    ValidatorService.charge.validateCharge(req)
      .then(checkAuthorization)
      .then(transformReq)
      .then(buildPrefixSelector)
      .then(findRate)
      .then(findWallets)
      .then(chargeWallets)
      .then(processResult)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/credits
   * @apiVersion 2.3.15
   * @apiName getCredits
   * @apiGroup Charge
   * @apiDescription returns the team credits
   */
  getCredits: function(req, res) {
    var transformRequest = TransformerService.customer.get(req);

    var getWallet = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(team) {

        return TeamCredit.findOne({
          team: team.id
        })

      }).catch(function(err) {
        console.log('err', err);
      });
    };

    transformRequest
      .then(getWallet)
      .then(TransformerService.charge.sendCredits)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
}