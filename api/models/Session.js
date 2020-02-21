'use strict';

module.exports = {
  connection: 'redis',
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: 'string'
    },
    pid: {
      type: 'string'
    }
  }
};