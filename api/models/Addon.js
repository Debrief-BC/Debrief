'use strict';
/**
 * Addon.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    price: {
      type: 'string',
      required: true
    },
    unit: {
      type: 'string',
      required: true
    },
    users: {
      collection: 'teamuser',
      via: 'addon'
    },
    deletedAt: {
      type: 'datetime'
    }
  }
};