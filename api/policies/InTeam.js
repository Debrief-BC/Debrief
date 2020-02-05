'use strict';

module.exports = (req, res, next) => {
  if (!req.isSuperAdmin || !req.isFreeswitch) {
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
      if (teamUser) {
        return next();
      }

      return res.notFound();
    }

    return getTeamId().then(getTeamUser).then(respond);

  } else {
    return next();
  }
}