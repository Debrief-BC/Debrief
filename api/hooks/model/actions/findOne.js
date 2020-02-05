'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var actionUtilSubstitutes = require('../actionUtilSubstitutes');
var Promise = require('bluebird');

module.exports = function(req, allowedPopulateFields, allowedSubscribeFields, findCriteria, model) {
  return new Promise(function(resolve, reject) {
    var criteria = findCriteria || actionUtil.requirePk(req);
    var subscribe = req.param('subscribe') || '';
    /* Soft Deletes
    if(typeof findCriteria !== 'object') {
        var tmpCriteria = {};
        tmpCriteria[model.primaryKey] = findCriteria;
        findCriteria = tmpCriteria;
    }
    findCriteria.deletedAt = null;*/
    var populate = [];
    //ensure that only allowed fields are being populated
    if (req.param('populate')) {
      var tmpPopulate = req.param('populate');
      if (typeof tmpPopulate === 'string') {
        tmpPopulate = tmpPopulate.replace(/\[|\]/g, '');
        tmpPopulate = (tmpPopulate) ? tmpPopulate.split(',') : [];
      }
      allowedPopulateFields.forEach(function(field) {
        if (typeof field === 'string' && tmpPopulate.indexOf(field) > -1) {
          populate.push(field);
        } else if (field.name && tmpPopulate.indexOf(field.name) > -1) {
          populate.push(field);
        }
      });
      tmpPopulate = populate; //.join(',');

      if (req.params && req.params.populate) {
        req.params.populate = tmpPopulate;
      }
      if (req.query && req.query.populate) {
        req.query.populate = tmpPopulate;
      }
      if (req.body && req.body.populate) {
        req.body.populate = tmpPopulate;
      }
    }

    var query = model.findOne(criteria);
    query = actionUtilSubstitutes.populateRequest(query, req);
    query.exec(function found(err, matchingRecord) {
      if (err) return reject(err);
      if (!matchingRecord) return resolve(null);

      if (req._sails.hooks.pubsub && req.isSocket) {
        model.subscribe(req, matchingRecord);
        if (typeof subscribe === 'string') {
          subscribe = subscribe.replace(/\[|\]/g, '');
          subscribe = subscribe.split(',');
        }
        var extraContexts = [];
        allowedSubscribeFields.forEach(function(field) {
          if (subscribe.indexOf(field) > -1) {
            extraContexts.push('add:' + field);
            extraContexts.push('remove:' + field);
          }
        });
        model.subscribe(req, matchingRecord, extraContexts);
        actionUtil.subscribeDeep(req, matchingRecord);
      }

      resolve(matchingRecord);
    });
  });
};