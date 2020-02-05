'use strict';

module.exports = {
  /**
   * @api {get} /team/:id/credit-card
   * @apiVersion 2.3.15
   * @apiName GetCreditCards
   * @apiGroup Credit Card
   * @apiDescription returns a list of credit cards associated with a company/user (?)
   */

  find(req, res) {
    let transformRequest = TransformerService.creditcards.get(req);

    let filterCreditCards = () => {
      return Team.findOne({
        id: req.param('id')
      }).then((team) => {

        if (team.billingId) {
          return CreditCards.find(team.billingId);
        } else {
          return res.ok({});
        }

      }).catch((err) => {
        throw new Error(err);
      });
    };

    transformRequest
      .then(filterCreditCards)
      .then(TransformerService.creditcards.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /credit-card/:id/setDefault
   * @apiVersion 2.3.15
   * @apiName SetDefaultCredit
   * @apiGroup Credit Card
   * @apiDescription returns the details of an individual credit card
   * @apiParam {string} id
   */

  setDefault(req, res) {
    CreditCards.setDefault(req.param('id'))
      .then(TransformerService.creditcards.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /countries
   * @apiVersion 2.3.15
   * @apiName GetCreditCard
   * @apiGroup Credit Card
   * @apiDescription returns the details of an individual credit card
   * @apiParam {string} id
   */

  getCountries(req, res) {
    CreditCards.getCountries()
      .then(TransformerService.creditcards.sendCountries)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /credit-card/:id
   * @apiVersion 2.3.15
   * @apiName GetCreditCard
   * @apiGroup Credit Card
   * @apiDescription returns the details of an individual credit card
   * @apiParam {string} id
   */

  findOne(req, res) {
    return res.ok('not implemented yet');
  },

  /**
   * @api {patch} /credit-card/:id
   * @apiVersion 2.3.15
   * @apiName SetDefaultCreditCard
   * @apiGroup Credit Card
   * @apiDescription Sets the default credit card
   * @apiParam {string} id
   */

  update(req, res) {
    return res.ok('not implemented yet');
  },

  /**
   * @api {delete} /credit-card/:id
   * @apiVersion 2.3.15
   * @apiName GetCreditCard
   * @apiGroup Credit Card
   * @apiDescription Deletes a credit card
   * @apiParam {string} id
   */

  destroy: function(req, res) {
    CreditCards.delete(req.param('id'))
      .then(res.ok)
      .catch(res.generalError);
  }
}