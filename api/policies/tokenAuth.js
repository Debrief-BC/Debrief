'use strict';

module.exports = (req, res, next) => {
  let token;

  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      let scheme = parts[0];
      let credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.unauthorized({
        error_message: 'Require Authorization'
      });
    }
  } else if (req.param('token')) {
    token = req.param('token');
    delete req.query.token;
  } else {
    return res.unauthorized({
      error_message: 'No Authorization header was found'
    });
  }

  TokenService.verify(token).then(function(pid) {
    if (_.isEmpty(pid)) {
      return res.unauthorized({
        error_message: 'Invalid Token'
      });
    } else {
      if (pid === sails.config.freeswitch.client_id) {
        req.user = sails.config.freeswitch.client_id;
        req.isFreeswitch = true;
        return next();
      } else if (pid === sails.config.admin.client_id) {
        req.user = sails.config.admin.client_id;
        req.isFreeswitch = true;
        req.isSuperAdmin = true;
        return next();
      } else {
        User.pidToId(pid)
          .then(function(user) {
            req.user = user;
            return next();
          }).catch(function(err) {
            return res.unauthorized({
              error_message: "Invalid token"
            });
          });
      }
    }
  }).catch(function(err) {
    return res.unauthorized({
      error_message: 'Invalid Token'
    });
  });
};