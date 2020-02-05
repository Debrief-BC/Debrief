'use strict';

const faker = require('faker');

module.exports = {
  /**
   * @api {get} /team/:id/users
   * @apiVersion 2.3.15
   * @apiName GetTeamMembers
   * @apiGroup Team
   *
   * @apiDescription get the users in a team
   * @apiParam id the team's id
   * @apiUse queryParams
   * @apiUse populate
   *
   * @apiParam {string} [email] filters by email
   * @apiParam {string} [first_name] filters by first_name
   * @apiParam {string} [last_name] filters by last_name
   * @apiParam {string} [status] filters by status
   *
   * @apiSuccess {User[]} body An array of user objects
   * @apiUse minimalUser
   */
  find(req, res) {
    let transformRequest = () => {
      return TransformerService.teamuser.get(req);
    }

    let filterAndPopulate = () => {
      let deleted = req.param('deleted');
      let findQuery = {};

      if (deleted) {
        findQuery = {
          role: {
            "!": sails.config.guestRoleIndex
          },
          team: req.param('id'),
          deletedAt: {
            "!": null
          },
        };
      } else {
        findQuery = {
          role: {
            "!": sails.config.guestRoleIndex
          },
          team: req.param('id'),
          deletedAt: null
        };
      }

      if (req.param('accepted') === 'null') {
        findQuery.accepted = null;
      }

      return TeamUser.filter.find(req, {
        find: findQuery
      });
    };

    let addPrivateChats = (teamusers) => {
      if (req.param('private_chats')) {
        let teamuserids = _.pluck(teamusers, 'id');
        let teamuserById = _.indexBy(teamusers, 'id');

        return TeamUser.findOne({
            team: req.param('id'),
            user: req.user
          }).then((curuser) => {
            if (!curuser) return teamusers;
            return ChatUser.find({
                user: curuser.id,
                chatType: 'private',
                otherUser: teamuserids
              }).populate('chat')
              .then((chatusers) => {
                chatusers.forEach((chatuser) => {
                  teamuserById[chatuser.otherUser].privateChat = chatuser;
                });
                return _.values(teamuserById);
              })
              .catch(e => {
                throw new Error(e);
              });
          })
          .catch(e => {
            throw new Error(e);
          });
      } else {
        return teamusers;
      }
    }

    let filterUsersforGuests = (teamusers) => {
      if (!req.isSuperAdmin || !req.isFreeswitch) {
        /** If the current user is a guest
         *  only return the users that are a part of their chat
         *  as the members of their team
         *
         * This logic prevents a guest user from viewing any other member
         * of the team that's not part of their chat
         */
        return TeamUser
          .findOne({
            team: req.param('id'),
            user: req.user
          })
          .then((teamUser) => {
            if (teamUser) {
              if (teamUser.role === sails.config.guestRoleIndex) {
                return ChatUser.findOne({
                    user: teamUser.id
                  })
                  .then(chatuser => {
                    return Chat
                      .findOne({
                        id: chatuser.chat
                      })
                      .populate('users')
                      .then(chat => {
                        return chat.users;
                      })
                      .catch(err => {
                        throw new Error(err);
                      });
                  })
                  .catch(err => {
                    throw new Error(err);
                  });
              } else {
                return teamusers;
              }
            }
          })
          .catch(err => {
            throw new Error(err);
          });
      } else {
        /* If it's Freeswitch or SuperAdmin, just return all of the team */
        return teamusers;
      }

    };

    transformRequest()
      .then(filterAndPopulate)
      .then(addPrivateChats)
      .then(filterUsersforGuests)
      .then(TransformerService.teamuser.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {get} /team/:id/users/:userid
   * @apiVersion 2.3.15
   * @apiName GetTeamMember
   * @apiGroup Team
   *
   * @apiDescription Restores a removed user to a team
   * @apiParam id The team's unique id.
   * @apiParam userid The user's unique id
   *
   */
  findOne(req, res) {

    let transformRequest = function() {
      return TransformerService.teamuser.get(req);
    };

    let findUserInTeam = function() {

      return TeamUser.findOne({
        team: req.param('teamid'),
        user: req.param('userid')
      }).populate(['team', 'plan']);
    };

    let findPrivateChat = function(user) {

      return ChatUser.find({
          user: req.user,
          chatType: 'private',
          otherUser: req.param('userid')
        }).populate('chat').then(function(chatuser) {

          if (chatuser && !_.isEmpty(chatuser)) {
            user.privateChat = chatuser[0];
            return user;
          } else {
            return user;
          }

        })
        .catch(err => {
          throw new Error(err);
        });
    };

    transformRequest()
      .then(findUserInTeam)
      .then(findPrivateChat)
      .then(TransformerService.teamuser.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);

  },

  /**
   * @api {post} /team/:id/add
   * @apiVersion 2.3.15
   * @apiName AddTeamMember
   * @apiGroup Team
   *
   * @apiDescription Add a user to a team
   * @apiParam id The team's unique id.
   *
   * @apiBody first_name The first name of the user to be added
   * @apiBody last_name  The last name of the user to be added
   * @apiBody email The email address of the user to be added
   * @apiBody password (Optional) a default password that the user need to reset
   *
   */

  add(req, res) {
    let validate = ValidatorService.user.validateCreate(req.body);
    let transformRequest = () => {
      return TransformerService.teamuser.getAdd(req);
    };

    let addUsers = () => {
      return User.createAndPublish(req.body, req);
    };

    let getTeamData = (result) => {
      return Team.find({
          id: req.param('id')
        })
        .then((team) => {
          result.team = team;
          return result;
        }).catch(err => {
          throw new Error(err);
        });

    }

    let getRole = (result) => {
      let roleIndex = Object.keys(sails.config.roles).find(function(r) {
        return sails.config.roles[r] === req.body.role
      });

      result.role = roleIndex;
      return result;
    }

    let getPlan = (result) => {
      if (req.body.plan) {
        result.plan = req.body.plan;
        return result;
      } else {
        return Plan.findOne({
            country: result.country,
            defaultPlan: true
          }).then((plan) => {
            let planId = 1;
            if (plan) planId = plan.id;
            result.plan = planId;
            return result
          })
          .catch(err => {
            throw new Error(err);
          });
      }
    }

    let addUsersToTeam = (result) => {

      let role = result.role;
      let plan = result.plan;

      return TeamUser
        .create({
          user: result.id,
          team: req.param('id'),
          role: role,
          plan: plan,
          accepted: new Date().toISOString(),
          invitedBy: req.user,
          lastLogin: null
        }).then((result) => {
          return result;
        }).catch(err => {
          throw new Error(err);
        });
    };

    let addUserToTeamChat = (result) => {
      let findTeam = (teamId) => {
        return Team.findOne({
          id: teamId
        });
      }

      let findChat = (team) => {
        return Chat.findOne({
          name: team.name,
          team: team.id
        });
      }

      let addUser = (chat) => {
        if (chat) {
          return ChatUser.addAndPublish({
            chat: chat.id,
            user: result.id,
            favorite: true
          });
        }
      }

      return findTeam(result.team)
        .then(findChat)
        .then(addUser)
        .then(user => result)
        .catch(err => {
          throw new Error(err);
        });
    };

    let addContactToSaleForce = (teamUser) => {
      return Team.findOne({
        id: teamUser.team
      }).then((team) => {
        if (team) {
          let contact = {
            firstName: teamUser.firstname,
            lastName: teamUser.lastname,
            email: teamUser.email,
            role__c: req.body.role
          };

          Salesforce.createContact(team.name, contact);
        }

        return teamUser;
      }).catch((err) => {
        console.error(err);
        return teamUser;
      });
    };

    let addContactToBilling = (teamUser) => {
      return Team.findOne({
        id: teamUser.team
      }).then((team) => {
        if (team && team.activated === "active") {
          return Subscription.listSubscriptions(team.billingId, {
            query: "status:Active"
          }).then((subscriptions) => {
            let plan = null;

            subscriptions.forEach((subscription) => {
              if (subscription.planCode === sails.config.billing.defaultPlan) {
                plan = subscription;
              }
            });

            if (plan === null) {
              return Plan.findOne({
                code: sails.config.billing.defaultPlan
              }).then((defaultPlan) => {
                Plan.subscribePlan(defaultPlan, teamUser, team);
                return teamUser;
              }).catch(err => {
                throw new Error(err);
              });
            } else {
              plan.subscriptionProducts[0].quantity += 1;
              return Subscription.updateSubscription(plan).then(function() {
                return teamUser;
              }).catch(err => {
                throw new Error(err);
              });
            }
          });
        } else {
          return teamUser;
        }
      }).catch((err) => {
        console.error(err);
        return teamUser;
      });
    };

    let createCallRoute = (result) => {

      CallRoute.createUserRoute(result, result.team, 100)
        .then((route) => {
          console.log(route);
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        });

      return result;
    };

    let createUserOnAuth = (result) => {
      let user = {
        email: result.email,
        password: req.body.password,
        id: result.user
      };

      return User.createUserOnAuth(user).then(() => {
        return result;
      }).catch(err => {
        throw new Error(err);
      });
    };

    let sendEmail = (result) => {
      let getTeam = () => {
        return Team.findOne({
          id: result.team
        })
      };

      let getExisting = (team) => {
        return TeamUser.findOne({
          user: req.user,
          team: team.id
        }).then((teamuser) => {
          let emailOptions = {
            team: team,
            invite: teamuser
          }
          return emailOptions;
        }).catch(err => {
          throw new Error(err);
        });
      };

      let postEmail = (emailOptions) => {

        EmailService.sendEmail("NewUser", result, emailOptions, req.body.password);
        return result;
      };

      return getTeam()
        .then(getExisting)
        .then(postEmail);
    };

    let createNotification = (result) => {
      if (result.role !== sails.config.guestRoleIndex) {
        let notifications = [];
        return TeamUser.find({
            team: result.team
          }).then((teamusers) => {
            teamusers.forEach((teamuser) => {
              if (teamuser.id !== result.id) {
                let notification = {
                  type: 'user_added',
                  user: teamuser.id,
                  team: teamuser.team,
                  new_user: result.id,
                  read: false
                }
                notifications.push(notification);
              }
            })
            return Notifications.createAndPublish(notifications, req, req).then((notification) => {
              return result;
            }).catch(err => {
              throw new Error(err);
            });
          })
          .catch(err => {
            throw new Error(err);
          });
      } else {
        return result;
      }
    };

    validate
      .then(transformRequest)
      .then(addUsers)
      .then(getTeamData)
      .then(getRole)
      .then(getPlan)
      .then(addUsersToTeam)
      .then(addUserToTeamChat)
      .then(addContactToSaleForce)
      .then(addContactToBilling)
      .then(createCallRoute)
      .then(createUserOnAuth)
      .then(sendEmail)
      .then(createNotification)
      .then(TransformerService.teamuser.sendAdd) // TODO: match the response of "findOneInTeam"
      .then(res.created)
      .catch(res.generalError);

  },

  /**
   * @api {delete} /team/:id/users/:userid
   * @apiVersion 2.3.15
   * @apiName RemoveTeamMember
   * @apiGroup Team
   *
   * @apiUse apiHeader
   *
   * @apiDescription Deactivates a user to a team.
   * Completely removes the user if they are pending
   *
   * @apiParam id The team's unique id.
   * @apiParam userid The user's unique id
   *
   * @api {get} /user/:id
   *
   * @apiExample {curl} HTTP:
   *    curl -i http://localhost/team/a79392df201688867bb19f52715072d77/users/a3e108469961cbd1dd191657c1d37bacd
   *
   * @apiSuccess (200)
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *
   *  }
   *
   *  @apiError (404)
   *
   *  @apiErrorExample {json} Error-Response:
   *  HTTP/1.1 404 Not Found
   *  {
   *
   *  }
   *
   */

  remove(req, res) {
    let transformRequest = TransformerService.teamuser.get(req);

    let findUser = () => {
      return TeamUser.findOne({
        id: req.param('userid'),
        team: req.param('id')
      });
    };

    let removeContactToBilling = (teamUser) => {
      return Team.findOne({
        id: teamUser.team
      }).then((team) => {
        if (team.activated === "active") {
          return Subscription.listSubscriptions(team.billingId, {
            query: "status:Active"
          }).then((subscriptions) => {
            return Plan.findOne({
              id: teamUser.plan
            }).then((userPlan) => {
              let plan = null;
              subscriptions.forEach((subscription) => {
                if (subscription.planCode === userPlan.code) {
                  plan = subscription;
                }
              })
              plan.subscriptionProducts[0].quantity--;

              return Subscription.updateSubscription(plan).then(function() {
                return teamUser;
              }).catch(err => {
                throw new Error(err);
              });
            }).catch(err => {
              throw new Error(err);
            });
          });
        } else {
          return teamUser;
        }
      }).catch((err) => {
        console.error(err);
        return teamUser;
      });
    };

    let removeUserFromChats = (result) => {
      return ChatUser.destroy({
        user: result.id
      }).then(() => {
        return result;
      }).catch(err => {
        throw new Error(err);
      });
    };

    let removeUserFromTeam = (result) => {
      if (result.accepted) {
        return TeamUser.updateAndPublish({
          id: result.id
        }, {
          user: null,
          deletedUser: result.user,
          deletedAt: new Date()
        }).then(() => {
          return;
        }).catch(err => {
          throw new Error(err);
        });
      } else {
        return TeamUser.destroy({
          id: result.id
        }).exec(() => {
          return User.destroy({
            id: result.id
          });
        });
      }
    };

    let replaceChatOwners = (result) => {
      return Chat.find({
        owner: result.id
      }).populate('users').then((chats) => {
        return user;
      }).catch(err => {
        throw new Error(err);
      });
    }

    transformRequest
      .then(findUser)
      .then(removeContactToBilling)
      .then(removeUserFromChats)
      .then(removeUserFromTeam)
      //.then(replaceChatOwners)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /team/:id/users/:userid
   * @apiVersion 2.3.15
   * @apiName EditTeamUser
   * @apiGroup Team
   *
   * @apiDescription This edits a teamuser instance
   *
   * @apiParam {integer} id the Team id
   * @apiParam {integer} userid the user id
   * @apiParam (Body) {bool} [position] the users position in the team
   */
  editTeamUser(req, res) {
    let validate = () => {
      return ValidatorService.teamuser.validateEdit(req);
    };
    let teamUser = null;

    let editTeamUser = () => {
      let team = req.param('teamid');
      let user = req.param('userid');
      return TeamUser.updateAndPublish({
        user: user,
        team: team
      }, req.body, req);
    };

    let updateExtensions = () => {
      if (req.param('extension')) {
        let extension = req.param('extension');
        let team = req.param('teamid');
        let user = req.param('userid');
        return TeamUser.findOne({
          user: user,
          team: team
        }).then((user) => {
          teamUser = user;
          if (user.extension != extension + '') {
            let routeUpdate = [];
            return CallRoute.find({
              team: user.team,
              owner: user.id
            }).then((routes) => {
              routes.forEach((route, index) => {
                CallRoute.updateAndPublish({
                  id: route.id
                }, {
                  extension: extension[index]
                })
              });
              return;
            }).catch(err => {
              throw new Error(err);
            });
          } else {
            return;
          }
        });
      } else {
        return;
      }
    };

    let editPlan = (user) => {
      return TeamUser.findOne({
        user: req.param('userid'),
        team: req.param("teamid")
      }).then((teamUser) => {
        if (req.body.plan && parseInt(req.body.plan) !== teamUser.plan) {
          Plan.updateBilling(req.param('plan'), teamUser, teamUser.plan);
          return user;
        } else {
          return user;
        }
      });
    };

    let updateContactOnSaleForce = (teamUser) => {
      return Team.findOne({
        id: teamUser[0].team
      }).then((teamObj) => {

        let contact = {};

        if (req.body.firstname) {
          contact.firstName = req.body.firstname;
        }
        if (req.body.lastname) {
          contact.lastName = req.body.lastname;
        }
        if (req.body.position) {
          contact.title = req.body.position;
        }
        if (req.body.workNumber) {
          contact.phone = req.body.workNumber;
        }
        if (req.body.homeNumber) {
          contact.homePhone = req.body.homeNumber;
        }
        if (req.body.mobileNumber) {
          contact.mobilePhone = req.body.mobileNumber;
        }
        if (req.body.role) {
          contact.role__c = sails.config.roles[req.body.role];
          return Salesforce.find("Account", {
            Name: teamObj.name
          }, {
            Id: 1
          }).then((account) => {
            Salesforce.update("Contact", {
              AccountId: account[0].Id,
              email: teamUser[0].email
            }, contact)
            return teamUser;
          });
        } else {
          return Salesforce.find("Account", {
            Name: teamObj.name
          }, {
            Id: 1
          }).then((account) => {
            Salesforce.update("Contact", {
              AccountId: account[0].Id,
              email: teamUser[0].email
            }, contact)
            return teamUser;
          }).catch(err => {
            throw new Error(err);
          });
        }

      }).catch(function(err) {
        console.error(err);
        return teamUser;
      });
    };

    let uploadAvatar = function() {

      if (req.file && req.body.avatar === 'true') {
        return Files.upload(req, {
          user: req.param('userid'),
          team: req.param('teamid')
        }).then((file) => {
          if (file.length > 0) {
            req.body.avatar = file[0].url
          }
        }).catch(err => {
          throw new Error(err);
        });

      } else {
        delete req.body.avatar;
      }

    }

    TransformerService.teamuser.get(req)
      .then(validate)
      .then(uploadAvatar)
      .then(updateExtensions)
      .then(editPlan)
      .then(editTeamUser)
      .then(updateContactOnSaleForce)
      .then(TransformerService.teamuser.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
  /**
   * @api {get} /team/:id/pendingusers
   * @apiVersion 2.3.15
   * @apiName GetPendingTeamMembers
   * @apiGroup Team
   *
   * @apiDescription get the users in a team
   * @apiParam id the team's id
   * @apiUse queryParams
   * @apiUse populate
   *
   * @apiParam {string} [email] filters by email
   * @apiParam {string} [first_name] filters by first_name
   * @apiParam {string} [last_name] filters by last_name
   * @apiParam {string} [status] filters by status
   *
   * @apiSuccess {User[]} body An array of user objects
   * @apiUse minimalUser
   */
  findPending(req, res) {
    let transformRequest = () => {
      return TransformerService.teamuser.get(req);
    }

    let getTeamUser = () => {
      return TeamUser.findOne({
        user: req.user,
        team: req.param('id')
      })
    }
    let filterAndPopulate = (teamuser) => {
      if (req.isSuperAdmin || teamuser.role === sails.config.adminRoleIndex) {
        let findQuery = {
          role: {
            "!": sails.config.guestRoleIndex
          },
          team: req.param('id'),
          deletedAt: null,
          accepted: null
        }
      } else {
        let findQuery = {
          role: {
            "!": sails.config.guestRoleIndex
          },
          team: req.param('id'),
          deletedAt: null,
          accepted: null,
          invitedBy: teamuser.id
        }
      }

      return TeamUser.filter.find(req, {
        find: findQuery
      });
    };

    transformRequest()
      .then(getTeamUser)
      .then(filterAndPopulate)
      .then(TransformerService.teamuser.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {patch} /team/:id/users/:userid
   * @apiVersion 2.3.15
   * @apiName RestoreTeamMember
   * @apiGroup Team
   *
   * @apiDescription Restores a removed user to a team
   * @apiParam id The team's unique id.
   * @apiParam userid The user's unique id
   *
   */

  restore(req, res) {
    let transformRequest = TransformerService.teamuser.get(req);

    let authorize = () => {
      return TeamUser.findOne({
          user: req.user,
          team: req.param('id')
        })
        .then((teamuser) => {
          if (!teamuser || teamuser.role != sails.config.adminRoleIndex && !req.isSupterAdmin) throw {
            errorType: 'forbidden',
            response: 'must be an admin to restore a user'
          };
          return;
        }).catch(err => {
          throw new Error(err);
        });
    }

    let findUser = () => {
      return TeamUser.findOne({
        id: req.param('userid'),
        team: req.param('id')
      });
    };

    let addContactToBilling = (teamUser) => {
      return Team.findOne({
        id: teamUser.team
      }).then((team) => {
        if (team.activated === "active") {
          return Subscription.listSubscriptions(team.billingId, {
            query: "status:Active"
          }).then((subscriptions) => {
            return Plan.findOne({
              id: teamUser.plan
            }).then((userPlan) => {
              let plan = null;
              subscriptions.forEach((subscription) => {
                if (subscription.planCode === userPlan.code) {
                  plan = subscription;
                }
              })
              plan.subscriptionProducts[0].quantity++;

              return Subscription.updateSubscription(plan).then(() => {
                return teamUser;
              }).catch(err => {
                throw new Error(err);
              });
            }).catch(err => {
              throw new Error(err);
            });
          });
        } else {
          return teamUser;
        }
      }).catch((err) => {
        console.error(err);
        return teamUser;
      });
    };

    let removeUserFromTeam = (result) => {
      return TeamUser.updateAndPublish({
        id: result.id
      }, {
        user: result.deletedUser,
        deletedUser: null,
        deletedAt: null
      }).then(() => {
        return;
      }).catch(err => {
        throw new Error(err);
      });
    };

    transformRequest
      .then(authorize)
      .then(findUser)
      .then(addContactToBilling)
      .then(removeUserFromTeam)
      .then(res.ok)
      .catch(res.generalError);
  },
}