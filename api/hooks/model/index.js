'use strict';

var rawQuery = require('./actions/rawQuery.js'),
  find = require('./actions/find.js'),
  findOne = require('./actions/findOne.js'),
  createAndPublish = require('./actions/createAndPublish.js'),
  addAndPublish = require('./actions/addAndPublish.js'),
  removeAndPublish = require('./actions/removeAndPublish.js'),
  updateAndPublish = require('./actions/updateAndPublish.js'),
  destroyAndPublish = require('./actions/destroyAndPublish.js'),
  subscribe = require('./actions/subscribe.js'),
  subscribeUser = require('./actions/subscribeUser.js'),
  unsubscribeUser = require('./actions/unsubscribeUser.js'),
  pidHooks = require('./actions/pidHooks.js');

module.exports = function modelHook(s) {
  return {
    initialize: function(cb) {
      sails.on('hook:pubsub:loaded', function() {
        Object.keys(s.models).forEach(function(m) {
          s.models[m].filter = {
            find: function(req, options) {
              if (!options) {
                options = {};
              }
              var allowedFilterFields = options.filter || (s.models[m].defaultFilter || []);
              var allowedPopulateFields = options.populate || (s.models[m].defaultPopulate || []);
              var allowedSubscribeFields = options.subscribe || (s.models[m].defaultSubscribe || []);
              var allowedSearchFields = options.search || (s.models[m].defaultSearch || []);
              var findCriteria = options.find || null;
              return find(req, allowedFilterFields, allowedPopulateFields, allowedSubscribeFields, allowedSearchFields, findCriteria, s.models[m]);
            },
            findOne: function(req, options) {
              if (!options) {
                options = {};
              }
              var allowedPopulateFields = options.populate || (s.models[m].defaultPopulate || []);
              var allowedSubscribeFields = options.subscribe || (s.models[m].defaultSubscribe || []);
              var findCriteria = options.find || null;
              return findOne(req, allowedPopulateFields, allowedSubscribeFields, findCriteria, s.models[m]);
            }
          };

          s.models[m].createAndPublish = function(data, req) {
            if (!data) {
              return new Promise(function(res, rej) {
                rej('no data');
              });
            }
            if (!req) {
              req = false
            }

            return createAndPublish(data, req, s.models[m]);
          };

          s.models[m].addAndPublish = function(data, req) {
            if (!data) {
              return new Promise(function(res, rej) {
                rej('no data');
              });
            }
            if (!req) {
              req = false
            }

            return addAndPublish(data, req, s.models[m]);
          };

          s.models[m].removeAndPublish = function(find, req) {
            if (!find) {
              return new Promise(function(res, rej) {
                rej('no find criteria');
              });
            }
            if (!req) {
              req = false
            }

            return removeAndPublish(find, req, s.models[m]);
          };

          s.models[m].updateAndPublish = function(find, data, req) {
            if (!find) {
              return new Promise(function(res, rej) {
                rej('no find criteria');
              });
            }
            if (!data) {
              return new Promise(function(res, rej) {
                rej('no data');
              });
            }
            if (!req) {
              req = false
            }

            return updateAndPublish(find, data, req, s.models[m]);
          };

          s.models[m].destroyAndPublish = function(find, req) {
            if (!find) {
              return new Promise(function(res, rej) {
                rej('no find criteria');
              });
            }
            if (!req) {
              req = false
            }

            return destroyAndPublish(find, req, s.models[m]);
          };

          s.models[m].rawQuery = function(query, data) {
            return rawQuery(query, data, s.models[m]);
          };

          //pids
          s.models[m].pidToId = function(pids) {
            return pidHooks.pidToId(pids, s.models[m]);
          };
          s.models[m].pidToIdSync = function(pids) {
            return pidHooks.pidToIdSync(pids, s.models[m]);
          };
          s.models[m].idToPid = function(ids) {
            return pidHooks.idToPid(ids, s.models[m]);
          };
          s.models[m].idToPidSync = function(ids) {
            return pidHooks.idToPidSync(ids, s.models[m]);
          };

          //ensure pubsub/socket functions use pids rather than ids
          s.models[m].baseSubscribe = s.models[m].subscribe;
          s.models[m].subscribe = function(req, records, context) {
            subscribe(req, records, context, s.models[m]);
          };
          s.models[m]._message = s.models[m].message;
          s.models[m].message = function(id, data, req) {
            return s.models[m]._message(s.models[m].idToPidSync(id), data, req);
          };

          s.models[m]._publishAdd = s.models[m].publishAdd;
          s.models[m].publishAdd = function(id, alias, added, req, options) {
            return s.models[m]._publishAdd(s.models[m].idToPidSync(id), alias, added, req, options);
          };

          s.models[m]._publishRemove = s.models[m].publishRemove;
          s.models[m].publishRemove = function(id, alias, idRemoved, req, options) {
            return s.models[m]._publishRemove(s.models[m].idToPidSync(id), alias, idRemoved, req, options);
          };

          s.models[m]._publishCreate = s.models[m].publishCreate;
          s.models[m].publishCreate = function(id, alias, added, req, options) {
            return s.models[m]._publishCreate(s.models[m].idToPidSync(id), alias, added, req, options);
          };

          s.models[m]._publishUpdate = s.models[m].publishUpdate;
          s.models[m].publishUpdate = function(id, changes, req, options) {
            return s.models[m]._publishUpdate(s.models[m].idToPidSync(id), changes, req, options);
          };

          s.models[m]._publishDestroy = s.models[m].publishDestroy;
          s.models[m].publishDestroy = function(id, req, options) {
            return s.models[m]._publishDestroy(s.models[m].idToPidSync(id), req, options);
          };

          //Duplicate base pubsub messages, so they can be called from overrides
          if (s.models[m].publishAddOverride) {
            s.models[m].basePublishAdd = s.models[m].publishAdd;
            s.models[m].publishAdd = s.models[m].publishAddOverride;
          }
          if (s.models[m].publishRemoveOverride) {
            s.models[m].basePublishRemove = s.models[m].publishRemove;
            s.models[m].publishRemove = s.models[m].publishRemoveOverride;
          }
          if (s.models[m].publishCreateOverride) {
            s.models[m].basePublishCreate = s.models[m].publishCreate;
            s.models[m].publishCreate = s.models[m].publishCreateOverride;
          }
          if (s.models[m].publishUpdateOverride) {
            s.models[m].basePublishUpdate = s.models[m].publishUpdate;
            s.models[m].publishUpdate = s.models[m].publishUpdateOverride;
          }
          if (s.models[m].publishDestroyOverride) {
            s.models[m].basePublishDestroy = s.models[m].publishDestroy;
            s.models[m].publishDestroy = s.models[m].publishDestroyOverride;
          }

          //Add user-based subscription
          s.models[m].subscribeUser = function(userid, ids, contexts) {
            if (!contexts) {
              contexts = s.models[m].autosubscribe;
            }
            if (!Array.isArray(contexts)) {
              contexts = [contexts];
            }
            if (!Array.isArray(ids)) {
              ids = ids;
            }
            if (ids.length === 0) {
              return;
            } else {
              if (typeof ids[0] === 'object') {
                ids = _.pluck(ids, s.models[m].primaryKey);
              }
            }

            return subscribeUser(userid, ids, contexts, s.models[m]);
          };
          //Remove user-based subscription
          s.models[m].unsubscribeUser = function(userid, ids, contexts) {
            if (!contexts) {
              contexts = ['message', 'update', 'destroy'];
              s.models[m].associations.forEach(function(association) {
                if (association.type === 'collection') {
                  contexts.push('add:' + association.alias);
                  contexts.push('remove:' + association.alias);
                }
              });
            }
            if (!Array.isArray(contexts)) {
              contexts = [contexts];
            }
            if (!Array.isArray(ids)) {
              ids = ids;
            }
            if (ids.length === 0) {
              return;
            } else {
              if (typeof ids[0] === 'object') {
                ids = _.pluck(ids, s.models[m].primaryKey);
              }
            }

            unsubscribeUser(userid, ids, contexts, s.models[m]);
          };
        });
        cb();
      });
    }
  };
}