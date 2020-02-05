'use strict';

/**
 * Soft Delete
 *
 * Mark an item as deleted without removing it from the database
 */

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

module.exports = function(req, allowedPopulateFields, findCriteria, model) {
  return new Promise(function(resolve, reject) {
    var pk = findCriteria || actionUtil.requirePk(req);
    var deletedAt = {
      deletedAt: new Date()
    };

    var query = model.findOne(pk);
    query = actionUtil.populateRequest(query, req);
    return query.then(function foundRecord(record) {
      if (!record) reject('No record found with the specified `id`.');
      if (record.deletedAt) reject('No record found with specified `id`.');

      model.update(pk, deletedAt).exec(function destroyedRecord(err) {
        if (err) return reject(err);

        if (req._sails.hooks.pubsub) {
          Model.publishDestroy(pk, !req._sails.config.blueprints.mirror && req, {
            previous: record
          });
          if (req.isSocket) {
            Model.unsubscribe(req, record);
            Model.retire(record);
          }
        }

        return resolve(record);
      }).catch(reject);
    });
  });
};