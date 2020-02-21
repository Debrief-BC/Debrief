'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'teamid': {
        key: 'teamid',
        value: Team.pidToId
      },
      'userid': {
        key: 'userid',
        value: User.pidToId
      },
      'accepted': {
        key: 'accepted'
      },
      'position': {
        key: 'position'
      },
      'extension': {
        key: 'extension'
      },
      'role': {
        key: 'role',
        value: function(role) {
          return Object.keys(sails.config.roles).find(function(r) {
            return sails.config.roles[r] === role;
          });
        }
      },
      'plan': {
        key: 'plan',
        value: Plan.pidToId
      },
      'defaultCalendar': {
        key: 'defaultCalendar',
        value: Integration.pidToId
      },
      'defaultContacts': {
        key: 'defaultContacts',
        value: Integration.pidToId
      },
      'private_chats': 'private_chats',
      'avatar': 'avatar',
      'first_name': {
        key: 'firstname'
      },
      'last_name': {
        key: 'lastname'
      },
      'color': {
        key: 'color'
      },
      'email': {
        key: 'email'
      },
      'last_login': {
        key: 'lastLogin'
      },
      'user': {
        key: 'user',
        value: User.pidToId
      },
      'work_number': {
        key: 'workNumber'
      },
      'home_number': {
        key: 'homeNumber'
      },
      'mobile_number': {
        key: 'mobileNumber'
      },
      'website': {
        key: 'website'
      },
      'caller_id_name': {
        key: 'caller_id_name'
      },
      'caller_id_number': {
        key: 'caller_id_number'
      },
      'voicemail': {
        key: 'voicemail'
      },
      'forward': {
        key: 'forward'
      },
      'forward_number': {
        key: 'forward_number'
      },
      'deleted': 'deleted',
      'latitude': {
        key: 'latitude'
      },
      'longitude': {
        key: 'longitude'
      },
      'theme': {
        key: 'theme'
      }
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'user': {
        key: 'user',
        value: function(usr, rtnObj, srcObj) {
          return TransformerService.user.sendUserOrPid(usr)
            .then(function(user) {
              rtnObj.teamUserId = TeamUser.idToPidSync(srcObj.id);
              if (!user) return null;
              if (user.id) {
                rtnObj.id = user.id;
              } else {
                rtnObj.id = user;
              }
              return user;
            });
        }
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'role': {
        key: 'role',
        value: function(role) {
          return sails.config.roles[role];
        }
      },
      'plan': {
        key: 'plan',
        value: TransformerService.plan.sendPlanOrPid
      },
      'position': {
        key: 'position'
      },
      'routes': {
        key: 'routes',
        value: TransformerService.callroute.sendCallRouteOrPid
      },
      'defaultCalendar': {
        key: 'defaultCalendar',
        value: TransformerService.integration.sendIntegrationOrPid
      },
      'defaultContacts': {
        key: 'defaultContacts',
        value: TransformerService.integration.sendIntegrationOrPid
      },
      'accepted': {
        key: 'accepted'
      },
      'firstname': {
        key: 'first_name'
      },
      'lastname': {
        key: 'last_name'
      },
      'color': 'color',
      'avatar': {
        key: 'avatar'
      },
      'email': {
        key: 'email',
        value: function(email, rtnObj, srcObj) {
          var guestRoleIndex = _.findKey(sails.config.roles, 'guest');
          var user = srcObj.user

          if (srcObj.user && srcObj.user.id) {
            user = srcObj.user.id;
          }

          if (srcObj.role && srcObj.id) {
            if (srcObj.role == sails.config.guestRoleIndex || srcObj.role.id == sails.config.guestRoleIndex) {
              return GuestInvite.findOne({
                user: srcObj.user
              }).then(function(result) {
                if (result) {
                  return result.email;
                } else {
                  return null;
                }
              });
            } else {
              return email;
            }
          } else {
            return email;
          }

        }
      },
      'notification': {
        key: 'notification'
      },
      'status': 'status',
      'state': 'state',
      'privateChat': {
        key: 'privateChat',
        value: TransformerService.chatuser.send
      },
      'extension': 'extension',
      'lastLogin': {
        key: 'last_login'
      },
      'createdAt': {
        key: 'created_at'
      },
      'deletedAt': {
        key: 'deleted_at'
      },
      'workNumber': {
        key: 'work_number'
      },
      'homeNumber': {
        key: 'home_number'
      },
      'mobileNumber': {
        key: 'mobile_number'
      },
      'website': {
        key: 'website'
      },
      'caller_id_name': {
        key: 'caller_id_name'
      },
      'caller_id_number': {
        key: 'caller_id_number'
      },
      'voicemail': {
        key: 'voicemail'
      },
      'forward': {
        key: 'forward'
      },
      'forward_number': {
        key: 'forward_number'
      },
      'latitude': {
        key: 'latitude'
      },
      'longitude': {
        key: 'longitude'
      },
      'theme': {
        key: 'theme'
      },
      'thumb_url': {
        key: 'thumb_url'
      }
    });
  },
  sendUserOrPid: function(usersorids) {
    if (!usersorids) {
      return;
    }
    if ((Array.isArray(usersorids) && typeof usersorids[0] === 'object') || typeof usersorids === 'object' && !Array.isArray(usersorids)) {
      return TransformerService.teamuser.send(usersorids);
    } else {
      return TeamUser.find({
        id: usersorids
      }).then(function(teamusers) {
        if (Array.isArray(usersorids)) {
          return _.pluck(teamusers, 'user');
        }
        if (teamusers.length == 1) {
          return teamusers[0].user;
        }
        return teamusers;
      }).then(TransformerService.user.sendUserOrPid);
    }
  },
  invite: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'email': {
        key: 'email'
      },
      'plan': {
        key: 'plan',
        value: Plan.pidToId
      },
    });
  },
  activate: function(req) {
    return Transformer.buildGet(req, {
      'token': {
        key: 'token'
      },
      'email': {
        key: 'email'
      }
    });
  },
  sendAdd: function(user) {
    return Transformer.build(user, {
      'id': {
        key: 'id',
        value: TeamUser.idToPid
      },
      'user': {
        key: 'user',
        value: User.idToPid
      },
      'email': {
        key: 'email'
      },
      'firstname': {
        key: 'first_name'
      },
      'lastname': {
        key: 'last_name'
      }
    });
  },
  getAdd: function(req) {
    /**
     * Default user creation role to member
     * if one is not provided
     */

    if (!req.body.role) {
      req.body.role = "member";
    }

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Team.pidToId
      },
      'email': {
        key: 'email'
      },
      'password': {
        key: 'password'
      },
      'first_name': {
        key: 'firstname'
      },
      'last_name': {
        key: 'lastname'
      },
      'role': {
        key: 'role'
      },
      'plan': {
        key: 'plan',
        value: Plan.pidToId
      }
    });
  }
};