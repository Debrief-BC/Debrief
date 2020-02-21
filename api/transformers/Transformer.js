'use strict';

var Promise = require('bluebird');
var hideObj = {};

module.exports = {
  getConfig: {
    'populate': {
      key: 'populate'
    },
    'where': {
      key: 'where'
    },
    'limit': {
      key: 'limit'
    },
    'sort': {
      key: 'sort'
    },
    'skip': {
      key: 'skip'
    },
    'subscribe': {
      key: 'subscribe'
    },
    'search': {
      key: 'search'
    }
  },

  /**
   * Generic function for transforming an object
   * data - either an array or object that needs to be built for output
   * config - an object representing the transformation:
   * 				{'propertyName': null (no change) | string (the new name) | {key: string, processor: function (field) => object}}
   */
  build: function(data, config) {
    var Transformer = this;

    function defaultProcessor(object) {
      if (Array.isArray(object)) {
        if (object.length > 0) {
          return object;
        } else {
          return hideObj;
        }
      } else {
        return object;
      }
    }
    return new Promise(function(resolve, reject) {
      if (data instanceof Array) {
        if (data.length == 0) {
          return resolve([]);
        }
        var results = [];
        var promises = [];
        for (var i = 0; i < data.length; i++) {
          promises.push(new Promise(function(resolve, reject) {
            var id = i;
            return Transformer.build(data[i], config).then(function(r) {
              results[id] = r;
              return resolve();
            }).catch(reject);
          }));
        }
        return Promise.all(promises).then(function(r) {
          return resolve(results);
        }).catch(reject);
      } else {
        if (data === null || typeof data != 'object') {
          return resolve(data);
        }
        var returnObj = {};
        var promises = [];
        Object.keys(config).forEach(function(key) {
          if (data.hasOwnProperty(key)) {
            var newKey = key;
            if (typeof config[key] === 'string') {
              newKey = config[key];
            } else if (typeof config[key] === 'object' && config[key] && config[key].key) {
              newKey = config[key].key;
            }
            var processor = config[key] && config[key].value || defaultProcessor;

            var object = processor(data[key], returnObj, data);
            if (object && object.then) {
              promises.push(object);
              object.then(function(result) {
                return returnObj[newKey] = result;
              });
            } else {
              returnObj[newKey] = object;
            }
          }
        });
        if (promises.length > 0) {
          return Promise.all(promises).then(function(results) {
            return resolve(returnObj);
          }).catch(function(err) {
            reject(err);
          });
        } else {
          return resolve(returnObj);
        }
      }
    });
  },

  buildGet: function(req, config) {
    var Transformer = this;
    config = _.merge({}, config, Transformer.getConfig);

    if (!config.where.value) {
      config.where.value = function(json) {
        var criteria = JSON.parse(json);
        return new Promise(function(resolve, reject) {
          Transformer.build(criteria, config).then(function(where) {
            resolve(JSON.stringify(where));
          }).catch(reject);
        });
      };
    }

    var queryParams = req.query || {};
    var bodyParams = req.body || {};
    var pathParams = {};
    for (var key in req.params) {
      if (key != 'all') {
        pathParams[key] = req.params[key];
      }
    }

    var queryPromise = Transformer.build(queryParams, config).then(function(result) {
      req.query = result;
    });
    var bodyPromise = Transformer.build(bodyParams, config).then(function(result) {
      req.body = result;
    });
    var pathPromise = Transformer.build(pathParams, config).then(function(result) {
      if (result && typeof result === 'object') {
        Object.keys(result).forEach(function(key) {
          req.params[key] = result[key];
        });
      }
    });
    return Promise.all([queryPromise, bodyPromise, pathPromise]);
  }
};