'use strict';

const Transformer = require('./Transformer');

module.exports = {
  get(req) {

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'team_name': {
        key: 'name'
      },
      'slug': {
        key: 'slug'
      },
      'plan': {
        key: 'plan',
        value(plan) {
          return Plan.findOne({
            name: plan
          }).then((plan) => {
            return plan.id;
          }).catch(err => {
            console.log(`plan_err ${err}`)
            return null;
          });
        }
      },
      'extension': {
        key: 'extension'
      },
      'first_name': {
        key: 'firstname'
      },
      'last_name': {
        key: 'lastname'
      },
      'integration': {
        key: 'integration'
      },
      'owner': {
        key: 'owner',
        value: User.pidToId
      },
      'city': {
        key: 'city'
      },
      'country': {
        key: 'country'
      },
      'postal': {
        key: 'postal'
      },
      'state': {
        key: 'state'
      },
      'address_1': {
        key: 'address_1'
      },
      'address_2': {
        key: 'address_2'
      },
      'caller_id_name': {
        key: 'caller_id_name'
      },
      'caller_id_number': {
        key: 'caller_id_number'
      },
      'avatar': {
        key: 'avatar'
      },
      'team_avatar': {
        key: 'team_avatar'
      },
      'autoreception': {
        key: 'autoreception'
      },
      'lines': {
        key: 'lines'
      },
      'affiliate': {
        key: 'affiliate'
      },
      'timezone': 'timezone',
      'ref': {
        key: 'ref'
      },
      'hold_music': {
        key: 'hold_music'
      },
      'activated': {
        key: 'activated'
      }
    });
  },
  send: function(data) {

    return Transformer.build(data, {
      'name': {
        key: 'team_name'
      },
      'slug': {
        key: 'slug'
      },
      'plan': {
        key: 'plan',
        value: TransformerService.plan.sendPlanOrPid
      },
      'id': {
        key: 'id',
        value: Team.idToPid
      },
      'users': {
        key: 'users',
        value: TransformerService.teamuser.send
      },
      'departments': {
        key: 'departments'
      },
      'role': {
        key: 'role',
        value: function(role) {
          return sails.config.roles[role];
        }
      },
      'position': {
        key: 'position'
      },
      'billingId': {
        key: 'billing_id'
      },
      'extension': 'extension',
      'integration': 'integration',
      'defaultCalendar': {
        key: 'defaultCalendar',
        value: TransformerService.integration.sendIntegrationOrPid
      },
      'defaultContacts': {
        key: 'defaultContacts',
        value: TransformerService.integration.sendIntegrationOrPid
      },
      'firstname': {
        key: 'first_name'
      },
      'lastname': {
        key: 'last_name'
      },
      'color': 'color',
      'team_avatar': {
        key: 'team_avatar'
      },
      'avatar': {
        key: 'avatar'
      },
      'thumb_url': {
        key: 'thumb_url'
      },
      'email': {
        key: 'email'
      },
      'activated': {
        key: 'activated'
      },
      'city': {
        key: 'city'
      },
      'country': {
        key: 'country'
      },
      'postal': {
        key: 'postal'
      },
      'state': {
        key: 'state'
      },
      'address_1': {
        key: 'address_1'
      },
      'address_2': {
        key: 'address_2'
      },
      'caller_id_name': {
        key: 'caller_id_name'
      },
      'caller_id_number': {
        key: 'caller_id_number'
      },
      'autoreception': {
        key: 'autoreception'
      },
      'lines': {
        key: 'lines'
      },
      'wallet_settings': {
        key: 'wallet_settings'
      },
      'timezone': 'timezone',
      'theme': 'theme',
      'owner': {
        key: 'owner',
        value: TransformerService.teamuser.sendUserOrPid
      },
      'hold_music': {
        key: 'hold_music'
      },
    });
  },
  getAccount: function(req) {
    req.body.team_name = req.body.team_name || '';

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'billing_contact': {
        key: 'firstName'
      },
      'team_name': {
        key: 'companyname',
        value: function() {
          return Team.pidToId(req.param('id')).then(function(id) {
            return Team.findOne({
              id: id
            }).then(function(team) {
              return team.name;
            }).catch(function(e) {
              console.log(e);
            });
          }).catch(function(e) {
            console.log(e);
          });
        }
      },
      'email': {
        key: 'primaryEmail'
      }
    });
  },
  sendAccount(data) {
    return Transformer.build(data, {
      'firstName': {
        key: 'billing_contact'
      },
      'companyname': {
        key: 'team_name'
      },
      'primaryEmail': {
        key: 'email'
      },
      'id': {
        key: 'fusebill_id'
      }
    });
  },
  sendTeamOrPid(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.team.send(data);
    } else {
      return Team.idToPid(data);
    }
  },
  sendInfo: function(data) {

    return Transformer.build(data, {
      'name': {
        key: 'team_name'
      },
      'id': {
        key: 'id',
        value: Team.idToPid
      },
      'team_avatar': {
        key: 'team_avatar',
        value: function(file) {
          //return file && file != '' ? sails.config.s3BaseUrl + file : null;
          return file;
        }
      }
    });
  },
  getWallet(req) {

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'notifications': {
        key: 'notifications'
      },
      'threshold': {
        key: 'threshold'
      },
      'auto_refill': {
        key: 'auto_refill'
      },
      'refill_amount': {
        key: 'refill_amount'
      },
      'refill_point': {
        key: 'refill_point'
      },
    });
  },
  sendWallet(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Team.idToPid
      },
      'team': {
        key: 'team',
        value: Team.idToPid
      },
      'notifications': {
        key: 'notifications'
      },
      'threshold': {
        key: 'threshold'
      },
      'auto_refill': {
        key: 'auto_refill'
      },
      'refill_amount': {
        key: 'refill_amount'
      },
      'refill_point': {
        key: 'refill_point'
      },
    });
  },
  getVisit(req) {

    return Transformer.buildGet(req, {
      'ref': {
        key: 'ref'
      },
      'url': {
        key: 'url'
      },
    });
  },
};