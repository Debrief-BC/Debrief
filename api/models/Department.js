'use strict';

/**
 * Department.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    purpose: {
      type: 'string'
    },
    extension: {
      type: 'string',
    },
    callcenter_ring: {
      type: 'string'
    },
    callcenter_voicemail_password: {
      type: 'string'
    },
    callcenter_transfer_to: {
      model: 'callroute'
    },
    callcenter_max_time: {
      type: 'int'
    },
    callcenter_hold_music: {
      type: 'string'
    },
    owner: {
      model: 'teamuser',
    },
    users: {
      collection: 'users',
      via: 'departments',
      through: 'departmentuser'
    },
    team: {
      model: 'team'
    },
    deletedAt: {
      type: 'datetime'
    }
  }
};

/**
 * @apiDefine minimalDepartment
 *
 * @apiSuccess (Department) {string} name
 * @apiSuccess (Department) {string} extension
 * @apiSuccess (Department) {string} ring_type
 * @apiSuccess (Department) {integer} id
 * @apiSuccess (Department) {Team} team
 * @apiSuccess (Department) {User} owner
 */

/**
 * @apiDefine fullDepartment
 *
 * @apiSuccess (Department) {User[]} users
 */