'use strict';

/**
 * DepartmentController
 *
 * @description :: Server-side logic for managing departments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * @api {get} /department
   * @apiVersion 2.3.15
   * @apiName GetDepartments
   * @apiGroup Department
   *
   * @apiDescription This gets all the departments visible to the current user
   *
   * @apiSuccess {Department[]} body the array of departments
   *
   * @apiUse minimalDepartment
   * @apiUse fullDepartment
   */

  find: function(req, res) {
    let transformRequest = TransformerService.chat.get(req);

    let filterDepartments = () => {
      if (req.isSuperAdmin || req.isFreeswitch) {
        return Department.filter.find(req);
      } else {
        return TeamUser.findOne({
          user: req.user
        }).then(teamUser => {
          return Department.filter.find(req, {
            find: {
              team: teamUser.team
            }
          });
        })
      }
    };

    transformRequest
      .then(filterDepartments)
      .then(TransformerService.chat.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /department/:id
   * @apiVersion 2.3.15
   * @apiName GetDepartment
   * @apiGroup Department
   *
   * @apiDescription This gets the details of a specific department
   *
   * @apiParam {integer} id the department id
   *
   * @apiSuccess {Department} body the department object
   *
   * @apiUse minimalDepartment
   * @apiUse fullDepartment
   */

  findOne: function(req, res) {
    let transformRequest = TransformerService.chat.get(req);

    let filterDepartment = () => {
      return Department.filter.findOne(req, {
        id: req.param('id')
      });
    };

    transformRequest
      .then(filterDepartment)
      .then(TransformerService.chat.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /department
   * @apiVersion 2.3.15
   * @apiName CreateDepartment
   * @apiGroup Department
   *
   * @apiDescription This creates a new department
   *
   * @apiParam (body) {Department} body the department object
   *
   * @apiUse minimalDepartment
   * @apiUse fullDepartment
   */

  create: function(req, res) {
    if (req.user) {
      req.body.owner = req.user;
    }

    let validate = ValidatorService.department.validateCreate(req.body);

    let transformRequest = () => {
      return TransformerService.department.get(req)
    };

    let createDepartment = () => {
      return Department.createAndPublish(req.body, req)
        .then(function(department) {
          if (!department) return res.notFound();
          return department;
        })
        .catch(err => {
          throw new Error(err);
        });
    };

    let createCallRoute = department => {
      let extension = req.param('extension') || null;

      if (extension) {
        return CallRoute.createDepartmentRoute(department, department.team, {
          extension: extension
        }).then(function(callRoute) {
          department.extension = callRoute.extension
          return department;
        })
      } else {
        return CallRoute.createDepartmentRoute(department, department.team, {
          start_extension: 100
        }).then(function(callRoute) {
          department.extension = callRoute.extension
          return department;
        })
      }
    }

    validate
      .then(transformRequest)
      .then(createDepartment)
      .then(createCallRoute)
      .then(TransformerService.department.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /department/:id
   * @apiVersion 2.3.15
   * @apiName EditDepartment
   * @apiGroup Department
   *
   * @apiDescription This edits a department
   *
   * @apiParam {integer} id the department id
   * @apiParam (body) {Department} body the department object
   *
   * @apiUse minimalDepartment
   * @apiUse fullDepartment
   */

  update: function(req, res) {
    var validate = ValidatorService.department.validateUpdate(req.body);
    var transformRequest = TransformerService.department.get(req);

    var updateDepartment = function() {
      return Department
        .updateAndPublish({
          id: req.param('id')
        }, req.body, req);
    };

    validate
      .then(transformRequest)
      .then(updateDepartment)
      .then(TransformerService.department.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /department/:id
   * @apiVersion 2.3.15
   * @apiName DeleteDepartment
   * @apiGroup Department
   *
   * @apiDescription This deletes a department
   *
   * @apiParam {integer} id the department id
   */

  destroy: function(req, res) {
    return Department.updateAndPublish({
      id: req.param('id')
    }, {
      deletedAt: new Date().toISOString()
    }, req).then(function() {
      res.ok();
    });
  },

  /**
   * @api {post} /department/:id/users
   * @apiVersion 2.3.15
   * @apiName AddDeparmentUser
   * @apiGroup Department
   *
   * @apiDescription This adds a user to a department
   *
   * @apiParam {integer} id the department id
   * @apiParam (body) {integer} pid the user id to be added
   */

  users: function(req, res) {
    return res.ok('not implemented yet');
  },

  /**
   * @api {delete} /department/:id/users/:pid
   * @apiVersion 2.3.15
   * @apiName DeleteDeparmentUser
   * @apiGroup Department
   *
   * @apiDescription This removes a user from a department
   *
   * @apiParam {integer} id the department id
   * @apiParam {integer} pid the user id t
   */

  user: function(req, res) {
    return res.ok('not implemented yet');
  }
};