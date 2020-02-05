'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

module.exports = function addAndPublish(data, req, model) {
  return model.create(data).then(function(newInstance) {
    if (sails.hooks.pubsub) {
      if (req && req.isSocket) {
        model.subscribe(req, newInstance);
        model.introduce(req, newInstance);
      }
      var id = newInstance[model.primaryKey];

      var publishData = _.isArray(newInstance) ? _.map(newInstance, function(instance) {
        return instance.toJSON();
      }) : newInstance.toJSON();

      //model.publishCreate(publishData, req && !req.options.mirror && req);

      _.each(data, function(val, key) {
        if (val === null) {
          return;
        }
        var association = _.find(model.associations, {
          alias: key
        });

        // If the attribute isn't an assoctiation, return
        if (!association) return;

        // Get the associated model class
        var ReferencedModel = sails.models[association.type == 'model' ? association.model : association.collection];

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
          ReferencedModel.publishAdd(val, reverseAssociation.alias, id, req, {
            noReverse: true
          });
        }
      });
    }
    return newInstance;
  });
};