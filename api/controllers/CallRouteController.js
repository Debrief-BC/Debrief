'use strict';

module.exports = {
  /**
   * @api {get} /callroute
   * @apiVersion 2.3.15
   * @apiName GetCallRoutes
   * @apiGroup CallRoute
   *
   * @apiDescription This gets all call routes visible to the current user
   * @apiSuccess {CallRoute[]} body an array of the call routes
   */
  find: function(req, res) {
    var findTeam = function() {
      return Team.findOne({
        slug: req.param('slug')
      }).then(function(team) {
        if (!team) return [{
          team: 0
        }];
        return [{
          team: team.id
        }];
      });
    };

    var findTeamUsers = function() {
      return TeamUser.find({
        user: req.user
      });
    };

    var findRoute = function(teamusers) {
      var teams = _.pluck(teamusers, 'team');
      if (req.param('team') && teams.indexOf(req.param('team')) > -1) {
        teams = req.param('team');
      }
      return CallRoute.filter.find(req, {
        find: {
          team: teams
        }
      });
    };

    var populateBody = function(routes) {
      if (req.param('populate_body') != null) {
        var promises = [];

        routes.forEach(function(route) {
          var body = route.body;
          var team = route.team.id || route.team;
          Object.keys(body).forEach(function(key) {
            switch (body[key].type) {
              case "user":
                promises.push(TeamUser.findOne({
                  user: body[key].user,
                  team: team
                }).then(function(usr) {
                  body[key].user = usr;
                }));
                break;
              case "group":
                promises.push(TeamUser.find({
                  user: body[key].users,
                  team: team
                }).then(function(usrs) {
                  body[key].users = usrs;
                }));
                break;
              case "route":
                promises.push(CallRoute.findOne({
                  id: body[key].route
                }).then(function(route) {
                  body[key].route = route;
                }));
                break;
              case "room":
                promises.push(Chat.findOne({
                  id: body[key].room
                }).then(function(room) {
                  body[key].room = room;
                }));
                break;
              case "callcenter":
                promises.push(Chat.findOne({
                  id: body[key].room
                }).then(function(room) {
                  body[key].room = room;
                }));
                break;
            }
          });
        });

        return Promise.all(promises).then(function() {
          return routes;
        });
      }
      return routes;
    };

    var populateDidNumber = function(routes) {
      if (req.param('populate_didnumber') != null) {
        var promises = [];

        routes.forEach(function(route) {
          var team = route.team.id || route.team;
          promises.push(DidNumber.findOne({
            team: team,
            call_route: route.id
          }).then(function(didnbr) {
            route.didnumber = didnbr;
          }));
        });

        return Promise.all(promises).then(function() {
          return routes;
        });
      }
      return routes;
    }

    TransformerService.callroute.get(req)
      .then(function() {
        if (req.isFreeswitch && req.param('slug')) {
          return findTeam();
        } else if (!req.param('slug')) {
          return findTeamUsers();
        } else {
          throw {
            errorType: "validation",
            response: {
              slug: "slug is an invalid parameter"
            }
          };
        }
      })
      .then(findRoute)
      .then(populateBody)
      .then(populateDidNumber)
      .then(TransformerService.callroute.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {get} /callroute/:id
   * @apiVersion 2.3.15
   * @apiName GetCallRoute
   * @apiGroup CallRoute
   *
   * @apiDescription This gets a specific call route
   */
  findOne: function(req, res) {
    var findCallRoute = function() {
      return CallRoute.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      });
    };


    var populateBody = function(route) {
      if (req.param('populate_body') != null) {
        var promises = [];
        var body = route.body;
        var team = route.team.id || route.team;
        Object.keys(body).forEach(function(key) {
          switch (body[key].type) {
            case "user":
              promises.push(TeamUser.findOne({
                user: body[key].user,
                team: team
              }).then(function(usr) {
                body[key].user = usr;
              }));
              break;
            case "group":
              promises.push(TeamUser.find({
                user: body[key].users,
                team: team
              }).then(function(usrs) {
                body[key].users = usrs;
              }));
              break;
            case "route":
              promises.push(CallRoute.findOne({
                id: body[key].route
              }).then(function(route) {
                body[key].route = route;
              }));
              break;
            case "room":
              promises.push(Chat.findOne({
                id: body[key].room
              }).then(function(room) {
                body[key].room = room;
              }));
              break;
            case "callcenter":
              promises.push(Chat.findOne({
                id: body[key].room
              }).then(function(room) {
                body[key].room = room;
              }));
              break;
            case "record_voicemail":
              if (body[key].user) promises.push(TeamUser.findOne({
                user: body[key].user,
                team: team
              }).then(function(usr) {
                body[key].user = usr;
              }));
              if (body[key].room) promises.push(Chat.findOne({
                id: body[key].room
              }).then(function(room) {
                body[key].room = room;
              }));
              break;
            case "check_voicemail":
              if (body[key].user) promises.push(TeamUser.findOne({
                user: body[key].user,
                team: team
              }).then(function(usr) {
                body[key].user = usr;
              }));
              if (body[key].room) promises.push(Chat.findOne({
                id: body[key].room
              }).then(function(room) {
                body[key].room = room;
              }));
              break;
          }
        });
        if (route.draft) {
          Object.keys(route.draft).forEach(function(key) {
            switch (route.draft[key].type) {
              case "user":
                promises.push(TeamUser.findOne({
                  user: route.draft[key].user,
                  team: team
                }).then(function(usr) {
                  route.draft[key].user = usr;
                }));
                break;
              case "group":
                promises.push(TeamUser.find({
                  user: route.draft[key].users,
                  team: team
                }).then(function(usrs) {
                  route.draft[key].users = usrs;
                }));
                break;
              case "route":
                promises.push(CallRoute.findOne({
                  id: route.draft[key].route
                }).then(function(route) {
                  route.draft[key].route = route;
                }));
                break;
              case "room":
                promises.push(Chat.findOne({
                  id: route.draft[key].room
                }).then(function(room) {
                  route.draft[key].room = room;
                }));
                break;
              case "callcenter":
                promises.push(Chat.findOne({
                  id: route.draft[key].room
                }).then(function(room) {
                  route.draft[key].room = room;
                }));
                break;
              case "record_voicemail":
                if (route.draft[key].user) promises.push(TeamUser.findOne({
                  user: route.draft[key].user,
                  team: team
                }).then(function(usr) {
                  route.draft[key].user = usr;
                }));
                if (route.draft[key].room) promises.push(Chat.findOne({
                  id: route.draft[key].room
                }).then(function(room) {
                  route.draft[key].room = room;
                }));
                break;
              case "check_voicemail":
                if (route.draft[key].user) promises.push(TeamUser.findOne({
                  user: route.draft[key].user,
                  team: team
                }).then(function(usr) {
                  route.draft[key].user = usr;
                }));
                if (route.draft[key].room) promises.push(Chat.findOne({
                  id: route.draft[key].room
                }).then(function(room) {
                  route.draft[key].room = room;
                }));
                break;
            }
          });
        }

        return Promise.all(promises).then(function() {
          return route;
        });
      }
      return route;
    };
    var populateDidNumber = function(route) {
      if (req.param('populate_didnumber') != null) {
        var team = route.team.id || route.team;
        return DidNumber.findOne({
          team: team,
          call_route: route.id
        }).then(function(didnbr) {
          route.didnumber = didnbr;
          return route
        });
      }
      return route;
    };

    TransformerService.callroute.get(req)
      .then(findCallRoute)
      .then(populateBody)
      .then(populateDidNumber)
      .then(TransformerService.callroute.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /callroute
   * @apiVersion 2.3.15
   * @apiName CreateCallRoute
   * @apiGroup CallRoute
   *
   * @apiDescription This creates a specific call route
   */
  create: function(req, res) {
    var setTeamUser = function() {
      if (req.param('owner')) {
        return TeamUser.findOne({
          team: req.param('team'),
          user: req.param('owner')
        }).then(function(user) {
          req.body.owner = user ? user.id : null;
        });
      }
    }

    var create = function() {
      return CallRoute.createAndPublish(req.body, req);
    };

    var validate = function() {
      return ValidatorService.callroute.validateCreate(req);
    };

    TransformerService.callroute.get(req)
      .then(validate)
      .then(setTeamUser)
      .then(create)
      .then(TransformerService.callroute.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /callroute/:id
   * @apiName EditCallRoute
   * @apiGroup CallRoute
   *
   * @apiDescription This edits a specific call route
   */
  edit: function(req, res) {
    var findCallRoute = function() {
      return CallRoute.findOne({
        id: req.param('id')
      });
    }

    var setTeamUser = function(callroute) {
      if (req.param('owner')) {
        return TeamUser.findOne({
          team: callroute.team,
          user: req.param('owner')
        }).then(function(user) {
          req.body.owner = user ? user.id : null;
        });
      }
    }

    var edit = function() {
      return CallRoute.updateAndPublish({
        id: req.param('id')
      }, req.body, req);
    };

    var validate = function() {
      return ValidatorService.callroute.validateEdit(req);
    };

    TransformerService.callroute.get(req)
      .then(validate)
      .then(findCallRoute)
      .then(setTeamUser)
      .then(edit)
      .then(TransformerService.callroute.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /callroute/:id
   * @apiVersion 2.3.15
   * @apiName DeleteCallRoute
   * @apiGroup CallRoute
   *
   * @apiDescription This deletes a specific call route
   */
  delete: function(req, res) {
    var destroy = function() {
      return CallRoute.destroyAndPublish({
        id: req.param('id')
      }, req);
    }

    TransformerService.callroute.get(req)
      .then(destroy)
      .then(res.ok)
      .catch(res.serverError);
  },
};