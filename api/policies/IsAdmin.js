'use strict';

module.exports = (req, res, next) => {
  if (!req.isSuperAdmin) {
    let getTeamId = () => {
      return new Promise((resolve, reject) => {
        let teamPid = req.param('team') || req.param('teamid') || null;

        if (teamPid) {
          return Team.pidToId(teamPid).then(teamId => {
            return resolve(teamId);
          }).catch((err) => {
            reject(err);
          });
        } else {
          return resolve(null);
        }
      });
    };

    let getTeamUser = (teamId) => {
      let criteria = {
        user: req.user
      };

      if (teamId) {
        criteria.team = teamId;
      }

      return TeamUser.findOne(criteria);
    };

    let respond = (teamUser) => {
      if (!teamUser) {
        return res.notFound();
      }

      // User is not an admin of the team
      if (teamUser.role !== sails.config.adminRoleIndex) {
        return res.notFound();
      }

      return next();
    }

    return getTeamId().then(getTeamUser).then(respond);

  } else {
    return next();
  }
}