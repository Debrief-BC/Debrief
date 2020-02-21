'use strict';

/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Fusebill = require('fusebill-node')(sails.config.billing.apiKey);
const maps = require('@google/maps');
const mapsClient = maps.createClient({
  key: sails.config.google.translate_apiKey,
  Promise: Promise
});

Fusebill.setHost(sails.config.billing.host);

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    slug: {
      type: 'string',
      unique: true
    },
    owner: {
      model: 'user'
    },
    plan: {
      model: 'plan'
    },
    billingId: {
      type: 'integer'
    },
    activated: {
      type: 'string'
    },
    chats: {
      collection: 'chat',
      via: 'team'
    },
    departments: {
      collection: 'department',
      via: 'team'
    },
    users: {
      collection: 'teamuser',
      via: 'team'
    },
    deletedAt: {
      type: 'datetime'
    },
    team_avatar: {
      type: 'string'
    },
    city: {
      type: 'string'
    },
    country: {
      type: 'string',
      required: true
    },
    postal: {
      type: 'string'
    },
    state: {
      type: 'string'
    },
    address_1: {
      type: 'string'
    },
    address_2: {
      type: 'string'
    },
    caller_id_name: {
      type: 'string'
    },
    caller_id_number: {
      type: 'string'
    },
    autoreception: {
      type: 'string'
    },
    lines: {
      type: 'text'
    },
    wallet: {
      type: 'boolean'
    },
    timezone: {
      type: 'string'
    },
    affiliate: {
      type: 'string'
    },
    pickupGroups: {
      type: 'string'
    },
    hold_music: {
      type: 'string'
    },
  },
  EncryptionSettings: {
    password: "t" + EncryptionService.settings.password
  },
  defaultFilter: ['name', 'slug', 'url', 'owner', 'plan'],
  defaultPopulate: ['users', 'departments', 'plan', 'owner'],
  createBillingCustomer(customer) {
    return Fusebill.customers.create(customer).then(function(customer) {
      Fusebill.customerActivation.activate({
        customerId: customer.id
      });
      return customer;
    })
  },
  customerId(id) {
    return Team.findOne({
      id: id
    }).then(function(team) {
      return team.billingId;
    }).catch(function(e) {
      return e;
    });
  },
  updatePlan(plan, teamId, req) {
    return Team.updateAndPublish({
      id: teamId
    }, {
      plan: plan
    }, req);
  },
  afterCreate(team, cb) {
    cb();
    TeamCredit.create({
      team: team.id,
      amount: 0,
      direction: 'both'
    }).then(function() {});
    TeamWallet.create({
      team: team.id,
      notifications: false,
      threshold: 0,
      auto_refill: false,
      refill_amount: 0,
      refill_point: 0
    }).then(function() {});
  },
  sendEmail(template, user, team) {
    sails.hooks.email.send(
      template, {
        link: sails.config.templateData.feServer + "/gateway/people/team",
        name: user.firstname,
      }, {
        to: user.email,
        subject: "Welcome to Debrief"
      },
      function(err) {
        if (err) console.log(err);
      }
    );
  },
  sendCancellationEmail(template, user, team) {
    sails.hooks.email.send(
      template, {
        name: user.firstname + " " + user.lastname,
        team: team.name,
        billingId: team.billingId,
        email: user.email
      }, {
        to: sails.config.supportEmail,
        subject: "Request to cancel Subscription"
      },
      function(err) {
        if (err) console.log(err);
      }
    );
  },
  findTimeZone(teamId, userId, country, state, city) {
    mapsClient.geocode({
      address: `${city}, ${state}, ${country}`
    }).asPromise().then((response) => {
      let results = response.json.results;
      return mapsClient.timezone({
          location: `${results[0].geometry.location.lat}, ${results[0].geometry.location.lng}`,
          timestamp: Date.now() / 1000 // Google requires the timestamp in seconds
        })
        .asPromise()
        .then((response) => {
          if (response) {
            Team.update({
                id: teamId
              }, {
                timezone: response.json.timezoneId
              })
              .then(team => {
                TeamUser.update({
                  id: userId
                }, {
                  timezone: response.json.timezoneId,
                  latitude: results[0].geometry.location.lat,
                  longitude: results[0].geometry.location.lng
                }).catch(err => {
                  throw new Error(err);
                });
              }).catch(err => {
                throw new Error(err);
              });
          }
        }).catch(err => {
          throw new Error(err);
        });
    }).catch(err => {
      throw new Error(err);
    });
  }
};

/**
 * @apiDefine minimalTeam
 *
 * @apiSuccess (Team) {string} name
 * @apiSuccess (Team) {string} slug
 * @apiSuccess (Team) {string} url
 * @apiSuccess (Team) {number} id
 * @apiSuccess (Team) {string} plan
 */

/**
 * @apiDefine fullTeam
 *
 *  @apiSuccess (Team) {Object[]} chats array of chats
 *  @apiSuccess (Team) {Object[]} departments array of departments
 *  @apiSuccess (Team) {Object[]} users  array of users
 */