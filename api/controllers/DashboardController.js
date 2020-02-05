module.exports = {
  /**
   * @api {get} /team/:id/timeline
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */

  main: function(req, res) {
    var getTeamUser = function() {
      var team = req.param('team');

      return TeamUser.findOne({
        user: req.user,
        team: team
      }).then(function(teamuser) {
        if (!teamuser) throw {
          errorType: 'forbidden',
          response: 'not part of this team'
        };
        return teamuser.id;
      });
    }

    var getMainDashboard = function(user) {
      var include = req.param('include') || ['files', 'links', 'status'];
      var skip = req.param('skip');
      var limit = req.param('limit');

      var files = include.indexOf('files') > -1;
      var links = include.indexOf('links') > -1;
      var status_messages = include.indexOf('status') > -1;

      return Dashboard.getMainDashboard(user, req.param('team'), files, links, status_messages, skip, limit)
    }
    TransformerService.dashboard.getMain(req)
      .then(getTeamUser)
      .then(getMainDashboard)
      .then(TransformerService.dashboard.sendMain)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/notifications
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */

  notifications: function(req, res) {
    var getTeamUser = function() {
      var team = req.param('team');

      return TeamUser.findOne({
        user: req.user,
        team: team
      }).then(function(teamuser) {
        if (!teamuser) throw {
          errorType: 'forbidden',
          response: 'not part of this team'
        };
        return teamuser.id;
      });
    }

    var getDashboardNotifications = function(user) {
      var include = req.param('include') || ['call_logs', 'at_mentions', 'voicemail'];
      var skip = req.param('skip');
      var limit = req.param('limit');

      var call_logs = include.indexOf('call_logs') > -1;
      var at_mentions = include.indexOf('at_mentions') > -1;
      var voicemail = include.indexOf('voicemail') > -1;

      return Dashboard.getDashboardNotifications(user, req.param('team'), call_logs, at_mentions, voicemail, skip, limit)
    }
    TransformerService.dashboard.getMain(req)
      .then(getTeamUser)
      .then(getDashboardNotifications)
      .then(TransformerService.dashboard.sendNotifications)
      .then(res.ok)
      .catch(res.generalError);
  },

  getTimeline: function(req, res) {
    var getTeamUser = function() {
      var team = req.param('team');

      return TeamUser.findOne({
        user: req.user,
        team: team
      }).then(function(teamuser) {
        if (!teamuser) throw {
          errorType: 'forbidden',
          response: 'not part of this team'
        };
        return teamuser.id;
      });
    }

    var getTimelineEvents = function(user) {
      var include = req.param('include') || ['files', 'links', 'status', 'call_logs', 'at_mentions', 'voicemail', 'events'];
      var skip = req.param('skip') ? parseInt(req.param('skip')) : 0;
      var limit = req.param('limit') ? parseInt(req.param('limit')) : 100;

      if (!Array.isArray(include)) {
        include = [include];
      }

      return Dashboard.getTimeline(user, req.param('team'), include, skip, limit)
    }
    TransformerService.dashboard.getMain(req)
      .then(getTeamUser)
      .then(getTimelineEvents)
      .then(TransformerService.dashboard.sendTimeline)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/timeline
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */

  getNotifications: function(req, res) {
    var getTeamUser = function() {
      var team = req.param('team');

      return TeamUser.findOne({
        user: req.user,
        team: team
      }).then(function(teamuser) {
        if (!teamuser) throw {
          errorType: 'forbidden',
          response: 'not part of this team'
        };
        return teamuser.id;
      });
    }

    var getNotificationEvents = function(user) {
      var include = req.param('include') || ['status', 'call_logs', 'at_mentions', 'voicemail', 'events'];
      var skip = req.param('skip') ? parseInt(req.param('skip')) : 0;
      var limit = req.param('limit') ? parseInt(req.param('limit')) : 100;

      if (!Array.isArray(include)) {
        include = [include];
      }

      return Dashboard.getNotifications(user, req.param('team'), include, skip, limit)
    }
    TransformerService.dashboard.getMain(req)
      .then(getTeamUser)
      .then(getNotificationEvents)
      .then(TransformerService.dashboard.sendNotifications)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /team/:id/timeline
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */

  setRead: function(req, res) {
    var updateNotification = function(user) {
      return Notifications.updateAndPublish({
        id: req.body.id
      }, {
        read: true
      });
    }
    TransformerService.dashboard.getNotification(req)
      .then(updateNotification)
      .then(TransformerService.dashboard.sendNotification)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /team/:id/timeline
   * @apiVersion 2.3.15
   * @apiName GetTransactions
   * @apiGroup Customer
   * @apiDescription returns a list of transactions associated with a company/user (?)
   */

  deleteNotification: function(req, res) {
    var checkNotification = function() {
      return Notifications.findOne({
        id: req.param('id')
      }).then(function(notification) {
        if (notification.deletedAt != null) {
          throw new Error("Notification already deleted");
        }
        return notification;
      });
    }
    var deleteNotification = function(user) {
      var deleted = {
        deletedAt: new Date().toISOString()
      }
      return Notifications.updateAndPublish({
        id: req.param('id')
      }, deleted).then(function(notif) {
        return res.ok("Deleted");
      });
    }
    TransformerService.dashboard.getNotification(req)
      .then(checkNotification)
      .then(deleteNotification)
      .catch(res.serverError);
  },
}