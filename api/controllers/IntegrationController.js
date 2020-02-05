'use strict';

module.exports = {
  /**
   * @api {get} /integration
   * @apiVersion 2.3.15
   * @apiName GetIntegrations
   * @apiGroup Integration
   * @apiDescription returns a list of integrations
   */

  find(req, res) {
    const transformRequest = TransformerService.integration.get(req);
    const filterIntegrations = function() {
      let findObj = {
        find: {
          owner: req.user
        }
      };
      return Integration.filter.find(req, findObj).then((integrations) => {
        if (!integrations) return res.notFound();
        return integrations;
      }).catch(err => {
        throw new Error(err);
      });
    };

    transformRequest
      .then(filterIntegrations)
      .then(TransformerService.integration.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /integration/:id
   * @apiVersion 2.3.15
   * @apiName GetIntegrations
   * @apiGroup Integration
   * @apiDescription returns the details of an individual integration
   * @apiParam {string} id
   */

  findOne(req, res) {
    const transformRequest = TransformerService.integration.get(req);
    const filterIntegration = () => {

      return Integration.filter.findOne(req, {
          find: {
            owner: req.user
          }
        })
        .then((integration) => {
          return integration;
        }).catch(err => {
          throw new Error(err);
        });

    };

    transformRequest
      .then(filterIntegration)
      .then(TransformerService.integration.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /integration
   * @apiVersion 2.3.15
   * @apiName AddIntegration
   * @apiGroup Integration
   * @apiDescription Adss an integration
   * @apiParam {string} id
   */

  create(req, res) {
    const validate = ValidatorService.integration.validateCreate(req);
    const transformRequest = () => {
      return TransformerService.integration.get(req);
    };

    const validateIntegration = () => {
      if (req.body.provider === "office365" || req.body.provider === "exchange") {
        return Integration.authExchange(req.body)
          .then((exch) => {
            const ewsFunction = "GetFolder";

            let ewsArgs = {
              'FolderShape': {
                'BaseShape': 'IdOnly',
              },
              'FolderIds': {
                'DistinguishedFolderId': {
                  'attributes': {
                    'Id': 'calendar'
                  }
                }
              }
            }

            return exch.run(ewsFunction, ewsArgs);
          });
      }
    }

    const createIntegration = () => {
      return Integration.createAndPublish(req.body, req);
    };

    const ensureDefaultCalendar = (integration) => {
      return Integration.ensureDefaultCalendar(req.user).then((res) => {
        return integration;
      }).catch(err => {
        throw new Error(err);
      });
    }

    validate
      .then(transformRequest)
      .then(validateIntegration)
      .then(createIntegration)
      .then(Integration.initialAuth)
      .then(Integration.ensureUniqueness)
      .then(ensureDefaultCalendar)
      .then(TransformerService.integration.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /integration/:id
   * @apiVersion 2.3.15
   * @apiName EditIntegration
   * @apiGroup Integration
   * @apiDescription Edits a integration
   * @apiParam {string} id
   */

  update(req, res) {
    var validate = ValidatorService.integration.validateUpdate(req);
    var transformRequest = function() {
      return TransformerService.integration.get(req);
    };

    var updateIntegration = function() {
      return Integration
        .updateAndPublish({
          id: req.param('id')
        }, req.body, req)
    };

    validate
      .then(transformRequest)
      .then(updateIntegration)
      .then(TransformerService.integration.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /integration/:id
   * @apiVersion 2.3.15
   * @apiName DeleteIntegration
   * @apiGroup Integration
   * @apiDescription Deletes a integration
   * @apiParam {string} id
   */

  destroy(req, res) {
    var findIntegration = function() {
      return Integration.findOne({
        id: req.param('id')
      });
    };

    var revokeAccess = function(integration) {
      if (!integration) return;
      return Integration.revokeAccess(integration);
    }

    var deleteIntegration = function(integration) {
      return Integration.destroy({
        id: req.param('id')
      }, req).then(function() {
        return integration;
      });
    }

    var ensureDefaultCalendar = function(integration) {
      return Integration.ensureDefaultCalendar(req.user).then(function(result) {
        return integration;
      });
    }

    TransformerService.integration.get(req)
      .then(findIntegration)
      .then(deleteIntegration)
      .then(ensureDefaultCalendar)
      .then(res.ok)
      .catch(res.serverError);
  }
}