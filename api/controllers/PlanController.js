'use strict';

module.exports = {
  /**
   * @api {get} /plan
   * @apiVersion 2.3.15
   * @apiName GetPlans
   * @apiGroup Plan
   * @apiDescription returns a list of plans
   */
  find: function(req, res) {

    var transformRequest = TransformerService.plan.get(req);

    let filterPlans = () => {
      if (req.isSuperAdmin || req.isFreeswitch) {
        return Plan.filter.find(req);
      } else {
        return TeamUser.findOne({
          user: req.user
        }).populate('team').then(teamUser => {
          return Plan.filter.find(req, {
            find: {
              country: teamUser.team.country
            }
          }).then(function(plans) {
            if (!plans || plans.length < 1) {
              return Plan.filter.find(req, {
                find: {
                  country: "united states"
                }
              })
            } else {
              return plans;
            }
          });
        })
      }
    }

    transformRequest
      .then(filterPlans)
      .then(TransformerService.plan.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /plan/:id
   * @apiVersion 2.3.15
   * @apiName GetPlans
   * @apiGroup Plan
   * @apiDescription returns the details of an individual plan
   * @apiParam {string} id
   */
  findOne: function(req, res) {
    var transformRequest = TransformerService.plan.get(req);
    var filterPlan = function() {
      return Plan.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      }).then(function(plan) {
        if (!plan) return res.notFound();
        return plan;
      });
    };

    transformRequest
      .then(filterPlan)
      .then(TransformerService.plan.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {patch} /plan/:id
   * @apiVersion 2.3.15
   * @apiName UpdatePlans
   * @apiGroup Plan
   * @apiDescription Updates an individual plan
   * @apiParam {string} id
   */
  update: function(req, res) {
    var transformRequest = TransformerService.plan.get(req);
    var updatePlan = function() {
      return Plan.update({
        id: req.param('id')
      }, req.body).then(function(plan) {
        return plan;
      });
    };

    transformRequest
      .then(updatePlan)
      .then(TransformerService.plan.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /plan
   * @apiVersion 2.3.15
   * @apiName CreatePlans
   * @apiGroup Plan
   * @apiDescription creates an individual plan
   */
  create: function(req, res) {
    var transformRequest = TransformerService.plan.get(req);
    var createPlan = function() {
      return Plan.create(req.body).then(function(plan) {
        return plan;
      });
    };

    transformRequest
      .then(createPlan)
      .then(TransformerService.plan.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  }
};