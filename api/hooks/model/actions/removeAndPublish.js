'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

module.exports = function removeAndPublish(find, req, model) {
  return new Promise(function(resolve, reject) {
    var pk = model.primaryKey;
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
            _.each(item, function(val, key) {
              if (val === null) {
                return;
              }
              var association = _.find(model.associations, {
                alias: key
              });

              // If the attribute isn't an assoctiation, return
              if (!association) return;

              // Get the associated model class
              var ReferencedModel = sails.models[association.type === 'model' ? association.model : association.collection];

              // Bail if the model doesn't exist
              if (!ReferencedModel) return;

              if (association.type == 'model') {
                var attribute = _.find(ReferencedModel._attributes, {
                  through: model.identity
                });
                var reverseAssociation = _.find(ReferencedModel.associations, {
                  collection: attribute.collection,
                  via: attribute.via
                });

                ReferencedModel.publishRemove(val, reverseAssociation.alias, item[pk], req, {
                  noReverse: true,
                  previous: item
                });
              }
            });
          });
        }
        return resolve();
      }).catch(reject);
    }).catch(reject);
  });
};