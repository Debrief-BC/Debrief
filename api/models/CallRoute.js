'use strict';

module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    extension: {
      type: 'string',
      required: true
    },
    team: {
      model: 'team',
      required: true
    },
    body: {
      type: 'json',
      required: true
    },
    draft: {
      type: 'json'
    },
    owner: {
      model: 'teamuser'
    },
    room: {
      model: 'chat'
    }
  },
  defaultFilter: ['extension', 'team', 'owner', 'name', 'room'],
  defaultPopulate: ['team', 'owner', 'room'],
  createUserRoute: function(teamuser, team, start_extension) {
    var query = "SELECT (SELECT min(cl1.extension) + 1 as next_ext FROM callroute as cl1 left join callroute as cl2  on cl1.extension = cl2.extension - 1 and cl1.team = cl2.team WHERE cl1.team=? and cl1.extension >= ? and cl1.extension REGEXP '^[0-9]+$' and cl2.extension is null) as next_ext, (SELECT min(extension) + 0 FROM callroute WHERE team=? and extension >= ? and extension REGEXP '^[0-9]+$') as first_ext;";
    var queryParams = [team, start_extension, team, start_extension];

    return CallRoute.rawQuery(query, queryParams)
      .then(function(result) {
        var next_ext = start_extension;
        if (result.length == 0) return next_ext;
        if (result[0].first_ext && result[0].first_ext <= next_ext) return result[0].next_ext;
        return next_ext;
      })
      .then(function(ext) {
        var call_route = {
          name: teamuser.firstname + " " + teamuser.lastname,
          owner: teamuser.id,
          team: team,
          body: {
            _startingPoint: {
              type: 'start',
              block: 'user'
            },
            user: {
              _pos: {
                x: 260,
                y: 10
              },
              type: 'user',
              user: teamuser.user
            }
          },
          extension: ext
        };

        return CallRoute.create(call_route);
      });
  },
  createDepartmentRoute: function(chat, team, extensionOptions) {
    if (extensionOptions.start_extension) {
      var query = "SELECT (SELECT min(cl1.extension) + 1 as next_ext FROM callroute as cl1 left join callroute as cl2  on cl1.extension = cl2.extension - 1 and cl1.team = cl2.team WHERE cl1.team=? and cl1.extension >= ? and cl1.extension REGEXP '^[0-9]+$' and cl2.extension is null) as next_ext, (SELECT min(extension) + 0 FROM callroute WHERE team=? and extension >= ? and extension REGEXP '^[0-9]+$') as first_ext;";
      var queryParams = [team, extensionOptions.start_extension, team, extensionOptions.start_extension];

      return CallRoute.rawQuery(query, queryParams)
        .then(function(result) {
          var next_ext = extensionOptions.start_extension;
          if (result.length == 0) return next_ext;
          if (result[0].first_ext && result[0].first_ext <= next_ext) return result[0].next_ext;
          return next_ext;
        })
        .then(function(ext) {
          var call_route = {
            name: chat.name,
            room: chat.id,
            team: team,
            body: {
              _startingPoint: {
                type: 'start',
                block: 'department'
              },
              department: {
                _pos: {
                  x: 260,
                  y: 10
                },
                type: 'callcenter',
                room: chat.id
              }
            },
            extension: ext
          };

          return CallRoute.create(call_route);
        });
    } else {
      var call_route = {
        name: chat.name,
        room: chat.id,
        team: team,
        body: {
          _startingPoint: {
            type: 'start',
            block: 'department'
          },
          department: {
            _pos: {
              x: 260,
              y: 10
            },
            type: 'callcenter',
            room: chat.id
          }
        },
        extension: extensionOptions.extension
      };

      return CallRoute.create(call_route);
    }
  },
  afterCreate: function(created, cb) {
    cb();
    if (created.owner) {
      CallRoute.find({
        owner: created.owner
      }).then(function(callroutes) {
        var extensions = _.pluck(callroutes, 'extension');
        TeamUser.updateAndPublish({
          id: created.owner
        }, {
          extension: extensions
        });
      });
    }
  },
  afterUpdate: function(updated, cb) {
    cb();
    if (updated.owner) {
      CallRoute.find({
        owner: updated.owner
      }).then(function(callroutes) {
        var extensions = _.pluck(callroutes, 'extension');
        TeamUser.updateAndPublish({
          id: updated.owner
        }, {
          extension: extensions
        });
      });
    }
  },
  publishUpdateOverride: function(id, updates, req, options) {
    CallRoute.findOne({
      id: id
    }).then(function(cr) {
      if (cr && options.previous && options.previous.owner != cr.owner) {
        CallRoute.find({
          owner: options.previous.owner
        }).then(function(callroutes) {
          var extensions = _.pluck(callroutes, 'extension');
          TeamUser.updateAndPublish({
            id: options.previous.owner
          }, {
            extension: extensions
          });
        });
      }
    });

    CallRoute.basePublishUpdate(id, updates, req, options);
  },
  afterDestroy: function(destroyed, cb) {
    cb();
    if (destroyed.owner) {
      CallRoute.find({
        owner: destroyed.owner
      }).then(function(callroutes) {
        var extensions = _.pluck(callroutes, 'extension');
        TeamUser.updateAndPublish({
          id: destroyed.owner
        }, {
          extension: extensions
        });
      });
    }
  },
  createAutoreceptionRoute: function(name, team, start_extension) {
    var query = "SELECT (SELECT min(cl1.extension) + 1 as next_ext FROM callroute as cl1 left join callroute as cl2  on cl1.extension = cl2.extension - 1 and cl1.team = cl2.team WHERE cl1.team=? and cl1.extension >= ? and cl1.extension REGEXP '^[0-9]+$' and cl2.extension is null) as next_ext, (SELECT min(extension) + 0 FROM callroute WHERE team=? and extension >= ? and extension REGEXP '^[0-9]+$') as first_ext;";
    var queryParams = [team, start_extension, team, start_extension];

    return CallRoute.rawQuery(query, queryParams)
      .then(function(result) {
        var next_ext = start_extension;
        if (result.length == 0) return next_ext;
        if (result[0].first_ext && result[0].first_ext <= next_ext) return result[0].next_ext;
        return next_ext;
      })
      .then(function(ext) {
        var call_route = {
          name: name,
          team: team,
          body: {
            "1": {
              "type": "audio",
              "_pos": {
                "x": 260,
                "y": 10
              },
              "file": "s3.amazonaws.com/debrief-production-files/autoreception.mp3",
              "next": 2
            },
            "2": {
              "type": "dtmf_router",
              "_pos": {
                "x": 520,
                "y": 10
              },
              "digits": {},
              "default": "1",
              "timeout": 10000,
              "num_digits": 6,
              "listen_for_extensions": true,
              "end_character": ""
            },
            "_startingPoint": {
              "_pos": {
                "x": 10,
                "y": 10
              },
              "block": 1,
              "type": "start"
            }
          },
          extension: ext
        };

        return CallRoute.create(call_route);
      });
  },
};