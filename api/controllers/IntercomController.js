'use strict';

/**
 * IntercomController
 *
 * @description :: Server-side logic for managing Intercom related services
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * @api {get} /intercom
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName Intercom
   * @apiGroup Intercom
   */
  createHash: function(req, res) {
    var validate = ValidatorService.intercom.validateCreate(req);
    var transformRequest = function() {
      return TransformerService.intercom.get(req)
    };

    var createIntercomHash = function() {
      return Intercom.createHash(req.body.email);
    };

    validate
      .then(transformRequest)
      .then(createIntercomHash)
      .then(TransformerService.intercom.send)
      .then(res.created)
      .catch(res.generalError);
  }
};