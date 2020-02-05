'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

module.exports = function destroyAndPublish(find, req, model) {
  return new Promise(function(resolve, reject) {
    var pk = model.primaryKey;
    var deletedAt = {
      deletedAt: new Date()
    };
    if (Object.keys(find).length === 0) {
      return reject('no criteria');
    }
    return model.find(find).then(function(originals) {
      if (originals.length === 0) {
        return resolve(null);
      }

      var originalDictionary = {};
      originals.forEach(function(original) {
        originalDictionary[original[pk]] = original;

      });
      return model.destroy(find).then(function() {
        if (req._sails.hooks.pubsub) {
          if (req.isSocket) {
            model.unsubscribe(req, originals);
            model.retire(originals);
          }
          originals.forEach(function(item) {
            model.publishDestroy(item[pk], !req.options.mirror && req, {
              previous: item
            });
          });

        }
        return resolve();
      }).catch(reject);
    }).catch(reject);
  });
};