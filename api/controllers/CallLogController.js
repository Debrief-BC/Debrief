'use strict';

module.exports = {
  /**
   * @api {get} /call-log
   * @apiVersion 2.3.15
   * @apiName GetCallLogs
   * @apiGroup CallLogs
   * @apiDescription Get the list of call logs
   */

  find: function(req, res) {
    if (!req.user) return res.forbidden();

    var find = function() {
      if (!req.param('sort')) {
        req.query['sort'] = 'time Desc';
      }
      var userfind = {
        user: req.user
      };
      if (req.param('team')) userfind.team = req.param('team');
      return TeamUser.find(userfind).then(function(teamusers) {
        var ids = _.pluck(teamusers, 'id');
        return CallLog.filter.find(req, {
          find: {
            owner: ids
          }
        });
      });
    }

    var populate_chat_participants = function(callogs) {
      if (req.param('populate_participants')) {
        var room_logs = _.filter(callogs, function(log) {
          return log.other_chat ? true : false
        });
        if (room_logs.length > 0) {
          var chats_populated = room_logs[0].other_chat.id ? true : false;
          var room_ids = chats_populated ? _.uniq(_.pluck(room_logs, 'other_chat.id')) : _.uniq(_.pluck(room_logs, 'other_chat'));
          return Chat.find({
            id: room_ids
          }).populate('users').then(function(chats) {
            var chats_by_id = _.indexBy(chats, 'id');
            room_logs.forEach(function(log) {
              log.other_chat = chats_populated ? chats_by_id[log.other_chat.id] : chats_by_id[log.other_chat];
            });
            return callogs;
          });
        }
      }
      return callogs;
    }

    TransformerService.calllog.get(req)
      .then(find)
      .then(populate_chat_participants)
      .then(TransformerService.calllog.send)
      .then(res.okOrNoContent)
      .catch(res.serverError)
  },

  /**
   * @api {get} /call-log
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName CreateCallLogs
   * @apiGroup CallLogs
   * @apiDescription create a of call log
   */

  create: function(req, res) {
    if (!req.isFreeswitch) return res.forbidden();

    var transform = function() {
      TransformerService.calllog.get(req);
    }

    var setTeam = function() {
      if (req.param('team')) {
        return req.param('team');
      } else {
        return Team.find({
          slug: req.param('slug')
        }).then(function(team) {
          if (!team || team.length == 0) throw new {
            errorType: 'validation',
            response: 'no such team'
          };
          return team[0].id;
        });
      }
    }

    var findTeamUsers = function(team) {
      var results = {
        team: team
      };

      var from = req.param('from');
      var to = req.param('to');

      results.from = from;
      results.to = to;

      var promises = [];

      if (from.user) {
        var fp = TeamUser.findOne({
          team: team,
          user: from.user
        }).then(function(teamuser) {
          if (teamuser) {
            results.from.user = teamuser.id;
          } else {
            results.from.user = null;
          }
        });
        promises.push(fp);
      }

      if (to.user) {
        var tp = TeamUser.findOne({
          team: team,
          user: to.user
        }).then(function(teamuser) {
          if (teamuser) {
            results.to.user = teamuser.id;
          } else {
            results.to.user = null;
          }
        });
        promises.push(tp);
      }

      return Promise.all(promises).then(function() {
        return results;
      });
    };

    var create = function(results) {

      var team = results.team;

      var duration = req.param('duration')
      var from = results.from;
      var to = results.to;
      var type_base = req.param('type') != 'call' ? req.param('type') + '_' : '';

      var promises = [];

      if (from.user) {
        promises.push(CallLog.createLog(type_base + 'outgoing', from.user, team, duration, to));
      }

      if (to.user) {
        promises.push(CallLog.createLog(type_base + 'incoming', to.user, team, duration, from));
      }

      if (from.user && to.user && req.param('type') != 'callcenter') {
        var promise = TeamUser.findOne({
          id: from.user
        }).then(function(fromTeam) {
          return TeamUser.findOne({
            id: to.user
          }).then(function(toTeam) {
            return CallLog.createChatMessage(req.param('type'), fromTeam, toTeam, duration, team)
          })
        })
        promises.push(promise);
      }
      return Promise.all(promises);
    };

    ValidatorService.calllog.validateCreate(req)
      .then(transform)
      .then(setTeam)
      .then(findTeamUsers)
      .then(create)
      .then(TransformerService.calllog.send)
      .then(res.created)
      .catch(res.generalError)
  }
};