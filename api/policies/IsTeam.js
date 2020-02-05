'use strict';

module.exports = (req, res, next) => {
  if (!req.param('team')) {
    return res.badRequest({
      errorType: 'validation',
      response: 'You must search as part of a team'
    });
  }

  return next();
}