'use strict';
/**
 * VoicemailPrefs.js
 *
 * @description :: This model mapps table voicemail_prefs
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

/* jshint node: true */

module.exports = {
  tableName: 'voicemail_prefs',
  attributes: {
    user: {
      model: 'user'
    },
    team: {
      model: 'team'
    },
    greeting: {
      model: 'files',
    },
    password: {
      type: 'string',
    },
  },
  defaultFilter: ['user', 'team'],
  defaultPopulate: ['user', 'team', 'greeting', 'password'],

  afterCreate: function(created, cb) {
    cb();
  },
  afterUpdate: function(updated, cb) {
    cb();
    // TODO: voicemmail was read, notify user
  },
  afterDestroy: function(deleted, cb) {
    cb();
    // TODO: update MWI, and chat msg also???
  },
};

/**
 * @apiDefine message
 *
 * @apiSuccess (message) {User} from
 * @apiSuccess (message) {string} type
 * @apiSuccess (message) {Object} body
 * @apiSuccess (message) {integer} id
 */