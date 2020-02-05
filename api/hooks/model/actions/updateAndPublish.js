'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

module.exports = function updateAndPublish(find, data, req, model) {
  return new Promise(function(resolve, reject) {
    var pk = model.primaryKey;
    return model.find(find).then(function(originals) {
      var originalDictionary = {};
      originals.forEach(function(original) {
        originalDictionary[original[pk]] = original;
      });
      return model.update(find, data).then(function(updated) {
        if (sails.hooks.pubsub) {
          if (req.isSocket) {
            model.subscribe(req, updated);
          }
          if (updated.length === 0) {
            return resolve(null);
          } else {
            updated.forEach(function(item) {
              model.publishUpdate(item[pk], _.cloneDeep(data), req && !req.options.mirror, {
                previous: _.cloneDeep(originalDictionary[item[pk]].toJSON())
              });
            });
          }
        }
        return resolve(updated);
      }).catch(reject);
    }).catch(reject);
  });
};