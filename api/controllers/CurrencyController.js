'use strict';

module.exports = {
  /**
   * @api {get} /currency
   * @apiVersion 2.3.15
   * @apiName GetCurrencies
   * @apiGroup Currency
   * @apiDescription returns a list of currencies
   */
  find: function(req, res) {
    var transformRequest = TransformerService.currency.get(req);

    let filterCurrencies = () => {
      if (req.isSuperAdmin || req.isFreeswitch) {
        return Currency.filter.find(req);
      } else {
        return;
      }
    }

    transformRequest
      .then(filterCurrencies)
      .then(TransformerService.currency.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /currency/:id
   * @apiVersion 2.3.15
   * @apiName GetCurrency
   * @apiGroup Currency
   * @apiDescription returns the details of an individual Currency
   * @apiParam {string} id
   */
  findOne: function(req, res) {
    var transformRequest = TransformerService.currency.get(req);
    let filterCurrency = () => {
      return Currency.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      }).then(function(currency) {
        if (!currency) return res.notFound();
        return currency;
      });
    };

    transformRequest
      .then(filterCurrency)
      .then(TransformerService.currency.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);

  },

  /**
   * @api {patch} /currency/:id
   * @apiVersion 2.3.15
   * @apiName UpdateCurrency
   * @apiGroup Currency
   * @apiDescription Updates an individual Currency
   * @apiParam {string} id
   */
  update: function(req, res) {
    var transformRequest = TransformerService.currency.get(req);
    var updateCurrency = function() {
      return Currency.update({
        id: req.param('id')
      }, req.body).then(function(currency) {
        return currency;
      });
    };

    transformRequest
      .then(updateCurrency)
      .then(TransformerService.currency.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /currency
   * @apiVersion 2.3.15
   * @apiName CreateCurrency
   * @apiGroup Currency
   * @apiDescription creates an individual Currency
   */
  create: function(req, res) {
    var transformRequest = TransformerService.currency.get(req);
    var createCurrency = function() {
      return Currency.create(req.body).then(function(currency) {
        return currency;
      });
    };

    transformRequest
      .then(createCurrency)
      .then(TransformerService.currency.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  }
};