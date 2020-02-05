'use strict';

module.exports = {
  /**
   * @api {post} /team/:id/accept
   * @apiVersion 2.3.15
   * @apiName ActivateTeamMember
   * @apiGroup Team
   *
   * @apiDescription Add a user to a team
   * @apiParam id The team's unique id.
   *
   *
   * @apiParam email The email address of the user to be added
   * @apiParam password (Optional) a default password that the user need to reset
   *
   */
  accept: function(req, res) {
    var validate = ValidatorService.teaminvite.validateAccept(req);
    var transformRequest = function() {
      return TransformerService.teaminvite.get(req);
    };
    var team = null;
    var email = null;
    var teamUser = {};
    var userExisting = false;

    var getInviteData = function(r) {
      return TeamInvite.findOne({
          id: req.body.token
        })
        .then(function(result) {
          team = result.team;
          email = result.email;
          return result;
        });
    };

    var getUserData = function(result) {
      return User.filter.findOne(req, {
        find: {
          email: result.email
        }
      });
    };

    var updateUserData = function(user) {
      if (!user.firstname) {
        return User.updateAndPublish({
          id: user.id
        }, {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          status: "active"
        }, req).then(function(u) {
          return TeamUser.updateAndPublish({
              team: team,
              user: user.id
            }, {
              accepted: new Date().toISOString()
            })
            .then(function(teamuser) {
              teamUser = teamuser;
              return u;
            });
        });
      } else {
        userExisting = true;
        return TeamUser.updateAndPublish({
            team: team,
            user: user.id
          }, {
            accepted: new Date().toISOString(),
            firstname: req.body.firstname,
            lastname: req.body.lastname
          })
          .then(function(teamuser) {
            teamUser = teamuser;
            return [user];
          });
      }
    };

    var updateContactOnSaleForce = function(user) {
      return Team.findOne({
        id: team
      }).then(function(teamObj) {

        var contact = {
          firstName: user[0].firstname,
          lastName: user[0].lastname
        };
        return Salesforce.find("Account", {
          Name: teamObj.name
        }, {
          Id: 1
        }).then(function(account) {
          Salesforce.update("Contact", {
            AccountId: account[0].Id,
            email: user[0].email
          }, contact);
          return user;
        });

      }).catch(function(err) {
        console.error(err);
        return user;
      });
    };

    var createCallRoute = function(user) {
      return CallRoute.createUserRoute(teamUser[0], teamUser[0].team, 100)
        .then(function(route) {
          console.log(route);
          return user;
        })
        .catch(function(err) {
          console.error(err);
          return user;
        });
    };

    var createUserOnAuth = function(result) {
      if (userExisting) {
        return result;
      }
      result = result[0];
      var buildOptions = function(user) {
        var host = sails.config.auth_api.url;
        var endpoint = '/user';
        var method = 'POST';
        var body = {
          email: result.email,
          password: req.body.password,
          pid: user
        };
        return ApiService.buildOptions(host, method, endpoint, body)
      };
      var executeOnAuth = function(options) {
        return ApiService.exec(options)
          .then(function(r) {
            return r;
          });
      };

      return User.idToPid(result.id)
        .then(buildOptions)
        .then(executeOnAuth)
        .then(function() {
          return result;
        });
    };

    var removeToken = function(r) {
      return TeamInvite.destroyAndPublish({
        id: req.param('token')
      }, req).then(function() {
        return {
          team: Team.idToPidSync(team),
          email: email
        };
      });
    };

    var updateLastLogin = function(user) {

      if (user.teams && user.teams.length > 0) {
        var team_id = user.teams[0].id;
        var user_id = user.id;

        TeamUser.updateAndPublish({
          user: team_id,
          team: user_id
        }, {
          'lastLogin': new Date().toISOString()
        }, req);
      }

      return user;

    };

    var createNotification = function(user) {
      return TeamUser.findOne({
        user: user.id
      }).then(function(result) {
        var notifications = [];
        return TeamUser.find({
          team: result.team
        }).then(function(teamusers) {
          teamusers.forEach(function(teamuser) {
            if (teamuser.id !== result.id) {
              var notification = {
                type: 'user_added',
                user: teamuser.id,
                team: teamuser.team,
                new_user: result.id,
                read: false
              }
              notifications.push(notification);
            }
          })
          return Notifications.createAndPublish(notifications, req, req).then(function(notification) {
            return user;
          });
        })

      });
    };

    validate
      .then(transformRequest)
      .then(getInviteData)
      .then(getUserData)
      .then(updateUserData)
      .then(updateContactOnSaleForce)
      .then(createCallRoute)
      .then(createUserOnAuth)
      .then(updateLastLogin)
      .then(createNotification)
      .then(removeToken)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {post} /team/:id/invite
   * @apiVersion 2.3.15
   * @apiName InviteTeamMember
   * @apiGroup Team
   *
   * @apiDescription Invite a user to a team
   * @apiParam id The team's unique id.
   *
   * @apiParam email The email address of the user to be added
   *
   */

  invite: function(req, res) {
    var validate = ValidatorService.teaminvite.validateInvite(req);
    var transformRequest = function() {
      return TransformerService.teamuser.invite(req);
    };
    var existingUser = undefined;
    var team = null;

    var createUserInvite = function() {

      var getTeamData = function() {
        return Team.filter.findOne(req, {
          find: {
            id: req.param('id')
          }
        }).then(function(result) {
          team = result;
          return result;
        });
      };

      var getUserData = function(result) {
        return User.filter.findOne(req, {
            find: {
              id: req.user
            }
          })
          .then(function(user) {
            user.team = result;
            existingUser = user;
            return user;
          });
      };

      var createInvites = function(result) {

        var promises = [];
        req.body.forEach(function(record) {
          promises.push(updateInviteTable(record));
        });

        return Promise.all(promises);
      };

      var updateInviteTable = function(result) {
        return TeamInvite
          .create({
            invitedBy: existingUser.id,
            team: existingUser.team.id,
            email: result.email
          })
          .then(function(r) {
            r.team = existingUser.team;
            r.plan = result.plan;
            return r;
          });
      };

      return getTeamData()
        .then(getUserData)
        .then(createInvites);
    };

    var createUsers = function(invites) {
      var emails = _.pluck(invites, 'email');
      return User.find({
        email: emails
      }).then(function(existingUsers) {
        var newUsers = [];
        req.body.forEach(function(newU) {
          var existU = _.where(existingUsers, {
            email: newU.email
          })
          if (existU.length > 0) {
            invites.forEach(function(invite) {
              if (invite.email == existU[0].email) {
                invite.user = existU[0];
              }
            });
          } else {
            newU.status = "pending";
            newUsers.push(newU);
          }
        });

        if (newUsers.length > 0) {
          return User.createAndPublish(newUsers).then(function(users) {

            invites.forEach(function(invite) {
              users.forEach(function(user) {
                if (invite.email == user.email) {
                  invite.user = user;
                }
              });
            });

            return invites;
          });
        }
        return invites;
      });
    };

    var addUsersToTeam = function(invites) {
      var promises = [];
      invites.forEach(function(record) {
        promises.push(addUserToTeam(record));
      });

      return Promise.all(promises);
    }

    var addUserToTeam = function(invite) {
      return Plan.find({
        country: team.country,
        defaultPlan: true
      }).then(function(plan) {
        var planId = 1;
        if (invite.plan) planId = invite.plan;
        else if (plan && plan.length > 0) planId = plan[0].id;

        return TeamUser
          .create({
            user: invite.user.id,
            team: req.param('id'),
            role: 3,
            plan: planId,
            invitedBy: invite.invitedBy
          })
          .then(function(r) {
            invite.teamUser = r;
            // console.log('invite 2', invite);
            return addContactToSaleForce(r).then(addContactToBilling).then(function() {
              return invite;
            });
          });
      })
    };

    let addUserToTeamChat = (result) => {
      let findTeam = (teamId) => {
        return Team.findOne({
          id: result[0].teamId
        });
      }

      let findChat = (team) => {
        return Chat.findOne({
          name: result[0].team.name,
          team: result[0].team.id
        });
      }

      let addUser = (chat) => {
        if (chat) {
          return ChatUser.addAndPublish({
            chat: chat.id,
            user: result[0].teamUser.id,
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


    var addContactToSaleForce = function(teamUser) {
      return Team.findOne({
        id: teamUser.team
      }).then(function(team) {

        var contact = {
          firstName: "Invited",
          lastName: "User",
          email: teamUser.email,
          role__c: "member"
        };

        Salesforce.createContact(team.name, contact)
        return teamUser;
      }).catch(function(err) {
        console.error(err);
        return teamUser;
      });
    };

    var addContactToBilling = function(teamUser) {
      return Team.findOne({
        id: teamUser.team
      }).then(function(team) {
        if (team.activated === "active") {
          return Subscription.listSubscriptions(team.billingId, {
            query: "status:Active"
          }).then(function(subscriptions) {
            return Plan.findOne({
              id: teamUser.plan
            }).then(function(userPlan) {
              var plan = null;
              subscriptions.forEach(function(subscription) {
                if (subscription.planCode === userPlan.code) {
                  plan = subscription;
                }
              })
              if (plan === null) {
                Plan.subscribePlan(userPlan, teamUser, team);
                return teamUser;
              } else {
                plan.subscriptionProducts[0].quantity += 1;
                return Subscription.updateSubscription(plan).then(function() {
                  return teamUser;
                })
              }
            });
          });
        } else {
          return teamUser;
        }
      }).catch(function(err) {
        console.error(err);
        return teamUser;
      });
    };

    var sendEmailToInvites = function(invites) {

      var promises = [];
      invites.forEach(function(record) {
        promises.push(sendEmail(record));
      });

      return Promise.all(promises);
    }

    var sendEmail = function(result) {
      var getExistingTeamUser = function() {
        return TeamUser.findOne({
          user: existingUser.id,
          team: result.team.id
        })
      };

      var getTeamId = function(teamuser) {
        return TeamInvite.idToPid(result.id).then(function(pid) {
          result.pid = pid;
          return teamuser;
        });
      };

      var postEmail = function(teamuser) {

        TeamInvite.sendEmail("UserInvite", result, result.team, teamuser);

        return result;
      };



      var returnResult = function(invite) {

        return {
          token: invite.id,
          userId: invite.teamUser.id,
          pid: invite.pid,
          user: invite.email
        };

      };

      return getExistingTeamUser()
        .then(getTeamId)
        .then(postEmail)
        .then(returnResult);

    };

    validate
      .then(transformRequest)
      .then(createUserInvite)
      .then(createUsers)
      .then(addUsersToTeam)
      .then(addUserToTeamChat)
      .then(sendEmailToInvites)
      .then(TransformerService.teaminvite.send)
      .then(res.created)
      .catch(res.generalError);

  },

  /**
   * @api {post} /team/:id/resendInvite
   * @apiVersion 2.3.15
   * @apiName ResendInvite
   * @apiGroup Team
   *
   * @apiDescription Resend invite email
   * @apiParam id The team's unique id.
   *
   * @apiParam email The email address of the user to resend invite email to
   *
   */

  resendInvite: function(req, res) {
    var validate = ValidatorService.teaminvite.validateResendInvite(req);
    var transformRequest = function() {
      return TransformerService.teamuser.invite(req);
    };
    var invite = {};

    var getTeamData = function() {
      return Team.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      }).then(function(result) {
        invite.team = result;
        return invite;
      });
    };

    var getExistingTeamUser = function(invite) {
      return TeamUser.findOne({
        user: req.user,
        team: invite.team.id
      }).then(function(teamuser) {
        invite.existingUser = teamuser;
        return invite;
      });
    };

    var getTeamInvite = function(invite) {
      return TeamInvite.findOne({
        email: req.body.email,
        team: invite.team.id
      }).then(function(teamInvite) {
        invite.teamInvite = teamInvite;
        return invite;
      });
    };
    var getTeamId = function(invite) {
      return TeamInvite.idToPid(invite.teamInvite.id).then(function(pid) {
        invite.teamInvite.pid = pid;
        return invite;
      });
    };

    var postEmail = function(invite) {

      TeamInvite.sendEmail("UserInvite", invite.teamInvite, invite.team, invite.existingUser);

      return invite;
    };



    var returnResult = function(invite) {

      return {
        token: invite.teamInvite.id,
        pid: invite.teamInvite.pid,
        user: req.body.email
      };

    };

    validate
      .then(transformRequest)
      .then(getTeamData)
      .then(getExistingTeamUser)
      .then(getTeamInvite)
      .then(getTeamId)
      .then(postEmail)
      .then(returnResult)
      .then(TransformerService.teaminvite.send)
      .then(res.ok)
      .catch(res.generalError);

  },
};