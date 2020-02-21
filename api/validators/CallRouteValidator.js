'use strict';

var Validation = require('validator');
var Validator = require('./Validator');
var Promise = require('bluebird');

module.exports = {
  validateUserBlock: function(block, bid, body, resp) {
    if (!block.user) {
      resp.blockErrors.push({
        bid: bid,
        user: "a user block must refer to a user"
      });
    }
    return;
  },
  validateGroupBlock: function(block, bid, body, resp) {
    if (!block.users) {
      resp.blockErrors.push({
        bid: bid,
        users: "a group block must refer to users"
      });
    }
    if (block.ring_type && block.ring_type != "sequential" && block.ring_type != "all-at-once") {
      resp.blockErrors.push({
        bid: bid,
        users: "a group block's ring_type must be either 'sequential' or 'all-at-once'"
      });
    }
    return;
  },
  validateRouteBlock: function(block, bid, body, resp) {
    if (!block.route) {
      resp.blockErrors.push({
        bid: bid,
        route: "a route block must refer to a route"
      });
    }
    return;
  },
  validateVoicemailBlock: function(block, bid, body, resp) {
    if (!block.box) {
      resp.blockErrors.push({
        bid: bid,
        box: "a voicemail block must refer to a voicemail box"
      });
    }
    return;
  },
  validateHangupBlock: function(block, bid, body, resp) {
    return;
  },
  validateBlock: function(block, bid, body, resp) {
    if (typeof block != "object") {
      resp.blockErrors.push("block " + bid + " must be a json object");
      return;
    }
    if (!block.type) {
      resp.blockErrors.push("block " + bid + " must have a type");
      return;
    }
  },
  validateBody: function(body, resp) {
    if (typeof body != "object") {
      resp.body = "body must be a json object";
      return;
    }
    if (body._startingPoint.block) body._startingPoint.type = "start";
    if (!body._startingPoint) {
      resp.body = "body needs a starting point";
    } else if (body._startingPoint.block && !body[body._startingPoint.block] || !body._startingPoint.block && !body[body._startingPoint]) {
      resp.body = "starting point is invalid";
    }

    resp.blockErrors = [];
    var promises = [];

    for (var bid in body) {
      if (bid == "_startingPoint") continue;
      promises.push(this.validateBlock(body[bid], bid, body, resp));
    }
    return Promise.all(promises).then(function() {
      if (resp.blockErrors.length === 0) {
        delete resp.blockErrors;
      }
    });
  },
  validateCreate: function(req) {
    var self = this;
    var response = {};
    Validator.require("extension", req, response);
    Validator.require("team", req, response);
    Validator.require("body", req, response);

    if (req.param('draft')) {
      response.draft = "call route can't be created in draft mode";
    }

    var validateOwner = function() {
      if (req.param('owner')) {
        return TeamUser.find({
          team: req.param('team'),
          user: req.param('owner')
        }).then(function(user) {
          if (!user || user.length == 0) {
            response.owner = "owner not found in team";
          }
          return;
        });
      } else {
        return;
      }
    };

    var validateUniqueExtension = function() {
      if (req.param('extension') && req.param('team')) {
        return CallRoute.find({
          team: req.param('team'),
          extension: req.param('extension')
        }).then(function(routes) {
          if (routes && routes.length > 0) {
            response.extension = "extension exists in team";
          }
          return;
        });
      }
    };

    var validateBody = function() {
      return self.validateBody(req.param("body"), response);
    };

    var finished = function() {
      return Validator.respond(response);
    };

    return Promise.all([validateOwner(),
        validateUniqueExtension(),
        validateBody()
      ])
      .then(finished);
  },
  validateEdit: function(req) {
    var self = this;
    var response = {};
    if (req.param('team')) {
      response.team = 'you cannot edit a routes team';
    }
    if (!req.param('id')) {
      response.id = 'id is required to edit';
    }

    var validateOwner = function() {
      if (req.param('owner')) {
        return CallRoute.findOne({
          id: req.param('id')
        }).then(function(callroute) {
          return TeamUser.find({
            team: callroute.team,
            user: req.param('owner')
          }).then(function(user) {
            if (!user || user.length == 0) {
              response.owner = "owner not found in team";
            }
            return;
          });
        });
      } else {
        return;
      }
    };

    var validateUniqueExtension = function() {
      if (req.param('extension')) {
        return CallRoute.findOne({
          id: req.param('id')
        }).then(function(route) {
          var team = route.team;
          if (route.extension != req.param('extension') + '') {
            return CallRoute.find({
              team: team,
              extension: req.param('extension')
            }).then(function(routes) {
              if (routes && routes.length > 0) {
                response.extension = "extension exists in team";
              }
              return;
            });
          } else {
            return;
          }
        });
      }
    };

    var validateBody = function() {
      if (req.param('body')) {
        return self.validateBody(req.param("body"), response);
      }
    };

    var validateDraft = function() {
      if (req.param('draft')) {
        var draft = {};
        return self.validateBody(req.param("draft"), draft).then(function() {
          if (Object.keys(draft).length > 0) {
            response.draft = draft;
          }
        });
      }
    };

    var finished = function() {
      return Validator.respond(response);
    };

    return Promise.all([validateOwner(),
        validateUniqueExtension(),
        validateBody(),
        validateDraft()
      ])
      .then(finished);
  }
};