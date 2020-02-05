/**
 * Locale.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    locale: {
      type: 'string'
    },
    label: {
      type: 'string',
    },
    value: {
      type: 'string'
    },
    language: {
      model: 'language'
    }
  },
  defaultPopulate: ['language'],
  defaultFilter: ['locale', 'label', 'value'],
};