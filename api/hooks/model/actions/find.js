'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var actionUtilSubstitutes = require('../actionUtilSubstitutes');
var Promise = require('bluebird');

module.exports = function(req, allowedFilterFields, allowedPopulateFields, allowedSubscribeFields, allowedSearchFields, findCriteria, model) {
  return new Promise(function(resolve, reject) {
    //Ensure only allowed fields are being used in the where segment
    var tmpParseCriteria = actionUtil.parseCriteria(req);
    var subscribe = tmpParseCriteria.subscribe || '';
    var parseCriteria = {};

    allowedFilterFields.forEach(function(field) {
      if (tmpParseCriteria[field]) {
        parseCriteria[field] = tmpParseCriteria[field];
      } else if (req.param(field)) {
        parseCriteria[field] = req.param(field);
      }
    });

    if (findCriteria) {
      for (let field in findCriteria) {
        parseCriteria[field] = findCriteria[field];
      }
    }

    if (tmpParseCriteria.search && allowedSearchFields.length > 0) {
      parseCriteria.or = [];
      allowedSearchFields.forEach(function(field) {
        if (!parseCriteria[field]) {
          var search = {};
          search[field] = {
            "contains": tmpParseCriteria.search
          };
          parseCriteria.or.push(search);
        }
      }, this);
    }
    /* Soft Deletes 
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

    var query = model.find()
      .where(parseCriteria)
      .limit(actionUtil.parseLimit(req))
      .skip(actionUtil.parseSkip(req))
      .sort(actionUtil.parseSort(req));
    query = actionUtilSubstitutes.populateRequest(query, req);
    return query.then(function(matchingRecords) {
      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req._sails.hooks.pubsub && req.isSocket) {
        model.subscribe(req, matchingRecords);

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

        model.subscribe(req, matchingRecords, extraContexts);
        // Also subscribe to instances of all associated models
        _.each(matchingRecords, function(record) {
          actionUtil.subscribeDeep(req, record);
        });
      }
      return resolve(matchingRecords);
    }).catch(reject);
  });
};