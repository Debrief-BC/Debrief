'use strict';

module.exports = (req, res, next) => {
  if (req.isSuperAdmin) {
    return next();
  } else {
    return res.notFound();
  }
}