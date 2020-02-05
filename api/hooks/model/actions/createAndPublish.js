'use strict';

var actionUtil = require('../../../../node_modules/sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

module.exports = function createAndPublish(data, req, model) {
  return model.create(data).then(function(newInstance) {
    if (sails.hooks.pubsub) {
      if (req && req.isSocket) {
        model.subscribe(req, newInstance);
        model.introduce(req, newInstance);
      }

      var publishData = _.isArray(newInstance) ? _.map(newInstance, function(instance) {
        return instance.toJSON();
      }) : newInstance.toJSON();
      model.publishCreate(publishData, req && !req.options.mirror && req);
    }
    return newInstance;
  });
};