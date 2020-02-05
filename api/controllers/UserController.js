'use strict';

module.exports = {
  /**
   * @api {get} /user
   * @apiVersion 2.3.15
   * @apiName GetUsers
   * @apiGroup User
   *
   * @apiDescription This gets an array of all the users visible to the current user. Returns an array of users.
   *
   * @apiUse queryParams
   * @apiUse populate
   *
   * @apiParam {string} [email] filters by email
   * @apiParam {string} [first_name] filters by first_name
   * @apiParam {string} [last_name] filters by last_name
   * @apiParam {string} [status] filters by status
   *
   * @apiParam (Populate) [team]
   *
   * @apiSuccess {User[]} body An array of user objects
   *
   * @apiUse minimalUser
   *
   * @apiUse apiErrorMessage
   */

  find(req, res) {
    let transformRequest = TransformerService.user.get(req);
    let filterUsers = () => {
      return TeamUser.find({
        user: req.user
      }).then((teamuser1) => {
        let teams = _.uniq(_.pluck(teamuser1, 'team'));
        if (req.isSuperAdmin) {
          return TeamUser.filter.find(req);
        } else {
          return TeamUser.find({
            team: teams
          });
        }

      });
    };

    transformRequest
      .then(filterUsers)
      .then(TransformerService.teamuser.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },


  /**
   * @api {get} /user/:id
   * @apiVersion 2.3.15
   * @apiName GetUser
   * @apiGroup User
   *
   * @apiDescription This gets the full details of a specific user by public user id (pid).
   * @apiParam id The user's unique public id.
   *
   *  @apiSuccess {User} body the user object
   */

  findOne(req, res) {
    let transformRequest = TransformerService.user.get(req);

    let filterUser = () => {

      let findObj = {
        find: {
          id: req.param('id')
        }
      };

      if (req.isFreeswitch) {
        findObj.populate = ['teams', 'chats', 'devices'];
      }

      return User.filter.findOne(req, findObj);
    };

    let getTeamUser = (user) => {
      if (req.isFreeswitch && req.param("slug") && user) {
        return Team.findOne({
          slug: req.param("slug")
        }).then((team) => {
          let pickupGroups = team.pickupGroups ? JSON.parse(team.pickupGroups) : null;
          return TeamUser.findOne({
              team: team.id,
              user: user.id
            }).then((teamUser) => {

              if (teamUser) {
                user.call_options = {
                  "caller_id_name": teamUser.caller_id_name ? teamUser.caller_id_name : null,
                  "caller_id_number": teamUser.caller_id_number ? teamUser.caller_id_number : null,
                  "voicemail": teamUser.voicemail,
                  "forward": teamUser.forward,
                  "forward_number": teamUser.forward_number,
                };
              }

              user.pickupGroup = null;
              if (pickupGroups) {
                for (let group in pickupGroups) {
                  if (pickupGroups[group].users.indexOf(User.idToPidSync(user.id)) !== -1) {
                    user.pickupGroup = group;
                    break;
                  }
                }
              }
              return user;
            })
            .catch(e => {
              throw new Error(e);
            });
        });
      }
      return user;
    };

    let findExtensions = (user) => {
      if (req.param('extension') && (req.param('current-team') || req.isFreeswitch) && user) {
        return TeamUser.findOne({
          user: req.param('id')
        }).then((teamUser) => {
          let findObj = {
            owner: teamUser.id
          };
          if (req.param('current-team')) {
            findObj.team = req.param('current-team');
          };
          return CallRoute.find(findObj).then((routes) => {
            let route_by_team = _.indexBy(routes, 'team');
            if (user.teams) {
              user.teams.forEach((team) => {
                if (route_by_team[team.id])
                  team.extension = route_by_team[team.id].extension;
              });
            }
            if (req.param('current-team') && routes.length > 0) {
              user.extension = routes[0].extension;
            }
            return user;
          });
        });
      }
      return user;
    };

    let transformResponse = (user) => {
      if (req.isFreeswitch) {
        return TransformerService.user.send(user, true);
      } else {
        return TransformerService.user.send(user);
      }
    }

    transformRequest
      .then(filterUser)
      .then(getTeamUser)
      .then(findExtensions)
      .then(transformResponse)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /user/me
   * @apiVersion 2.3.15
   * @apiName GetMe
   * @apiGroup User
   *
   * @apiDescription this gets the full details for the current user
   *
   * @apiSuccess {User} body the user object
   */
  me(req, res) {
    let transformRequest = TransformerService.user.get(req);
    let filterUser = () => {
      return User.filter.findOne(req, {
        find: {
          id: req.user
        },
        populate: ['teams', 'chats', 'devices', 'favorites']
      });
    };

    let findExtensions = (user) => {
      if (req.param('extension') && user.teams) {
        let findObj = {
          owner: req.user
        };
        return CallRoute.find(findObj).then((routes) => {
          let route_by_team = _.indexBy(routes, 'team');
          if (user.teams) {
            user.teams.forEach(function(team) {
              if (route_by_team[team.id])
                team.extension = route_by_team[team.id].extension;
            });
          }
          return user;
        });
      }
      return user;
    };

    let addTeamUserData = (user) => {

      let promises = [];
      _.each(user.teams, (t, i) => {
        let p = TeamUser.findOne({
            user: user.id,
            team: t.id
          })
          .populate('plan')
          .populate('defaultCalendar')
          .populate('defaultContacts')
          .then((teamuser) => {
            if (teamuser.plan) {
              user.teams[i].plan = teamuser.plan.code;
            }

            user.teams[i].role = teamuser.role;
            user.teams[i].position = teamuser.position;
            user.teams[i].defaultCalendar = teamuser.defaultCalendar;
            user.teams[i].defaultContacts = teamuser.defaultContacts;
            user.teams[i].firstname = teamuser.firstname;
            user.teams[i].lastname = teamuser.lastname;
            user.teams[i].avatar = teamuser.avatar;
            user.teams[i].thumb_url = teamuser.thumb_url;
            user.teams[i].notification = teamuser.notification;
            user.teams[i].color = teamuser.color;
            user.teams[i].email = teamuser.email;
            user.teams[i].extension = teamuser.extension;
            user.teams[i].theme = teamuser.theme;
          });
        promises.push(p);
      });

      return Promise.all(promises).then(() => {
        return user;
      });
    };

    let transformSend = (user) => {
      return TransformerService.user.send(user, true);
    };

    transformRequest
      .then(filterUser)
      .then(findExtensions)
      .then(addTeamUserData)
      .then(transformSend)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /user
   * @apiVersion 2.3.15
   * @apiName CreateUser
   * @apiGroup User
   *
   * @apiDescription This creates a user
   * @apiSuccess {User} body the user object
   */

  create(req, res) {
    let validate = ValidatorService.user.validateCreate(req.body);
    let transformRequest = () => {
      return TransformerService.user.get(req)
    };

    let createUser = () => {
      return User.createAndPublish(req.body, req);
    };

    let createUserOnAuth = (result) => {
      if (result.role !== 'guest') {
        let user = {
          email: result.email,
          password: req.body.password,
          id: result.id
        };

        return User.createUserOnAuth(user).then((r) => {
          return result;
        });
      } else {
        return result;
      }
    };

    validate
      .then(transformRequest)
      .then(createUser)
      .then(createUserOnAuth)
      .then(TransformerService.user.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /user/:id
   * @apiVersion 2.3.15
   * @apiName UpdateUser
   * @apiGroup User
   *
   * @apiDescription This updates a user
   * @apiParam id The user's unique id
   *
   * @apiParam (body) {User} body A User object, or any of it's fields
   * @apiUse minimalUser
   */

  update: function(req, res) {

    let validate = ValidatorService.user.validateUpdate(req);
    let transformRequest = function() {
      return TransformerService.user.get(req);
    };

    let checkPermissions = function() {
      return new Promise(function(resolve, reject) {

        if (req.user == req.param('id') || req.isFreeswitch) {
          resolve();
        } else if (req.user != req.param('id')) {

          User.find({
            id: req.param('id')
          }).populate("teams").then(function(user) {

            let teams = _.uniq(_.pluck(user, 'teams'));

            let team_ids = [];
            teams[0].forEach(function(team) {
              team_ids.push(team.id);
            });

            TeamUser.find().where({
              id: req.user,
              team: team_ids,
              role: sails.config.adminRoleIndex
            }).then(function(user) {

              if (user.length >= 1) resolve();
              else reject({
                errorType: 'forbidden'
              });

            });

          });

        }

      });

    };

    let uploadAvatar = function() {

      if (req.body.avatar === 'true') {
        return Files.upload(req, {
          user: req.param('id')
        }).then(function(file) {
          if (file.length > 0) {
            req.body.avatar = file[0].url;
            return TeamUser.updateAndPublish({
              user: req.param('id')
            }, {
              avatar: file[0].url,
              thumb_url: file[0].thumb_url
            });
          } else {
            return;
          }
        });

      }

    }

    let updateGeo = () => {
      if (req.body.longitude && req.body.latitude) {
        return TeamUser.updateAndPublish({
          user: req.param('id')
        }, {
          latitude: req.body.latitude,
          longitude: req.body.longitude
        });
      } else {
        return;
      }
    };

    let updateUser = function() {
      return User.updateAndPublish({
        id: req.param('id')
      }, req.body, req);
    };

    validate
      .then(transformRequest)
      .then(checkPermissions)
      .then(uploadAvatar)
      .then(updateGeo)
      .then(updateUser)
      .then(TransformerService.user.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /user/:id
   * @apiVersion 2.3.15
   * @apiName DeleteUser
   * @apiGroup User
   *
   * @apiDescription This deletes a user
   * @apiParam id The user's unique id.
   */

  destroy(req, res) {
    let transformRequest = () => {
      return TransformerService.user.get(req);
    }

    let deleteTeamUser = () => {
      return TeamUser.updateAndPublish({
        user: req.param('id')
      }, {
        deletedAt: new Date().toDateString()
      }, req);
    }

    let deleteUser = () => {
      return User.updateAndPublish({
        id: req.param('id')
      }, {
        deletedAt: new Date().toDateString()
      }, req);
    }

    transformRequest()
      .then(deleteTeamUser)
      .then(deleteUser)
      .then(res.ok({
        success: true
      }))
      .catch(res.generalError)
  },

  /**
   * @api {post} /user/exist
   * @apiVersion 2.3.15
   * @apiName UserExist
   * @apiGroup User
   *
   * @apiHeader {String} Authorization Bearer [token]
   *
   * @apiDescription This checks if a user already exists
   * @apiSuccess {User} body the user object
   */

  exist(req, res) {
    let validate = ValidatorService.user.validateExists(req.body);
    return validate.then(res.ok).catch(res.badRequest);
  }

};