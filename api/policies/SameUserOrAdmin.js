'use strict';

module.exports = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return User.pidToId(req.param('userid')).then(user => {
      return TeamUser.findOne({
        user: req.user
      }).then(teamUser => {

        if (!teamUser) {
          return res.notFound();
        } else if (teamUser.user === parseInt(user) || teamUser.role === sails.config.adminRoleIndex) {
          return next();
        } else {
          return res.notFound();
        }

      });
    }).catch(err => {
      throw new Error(err);
    });
  } else {
    return next();
  }
}