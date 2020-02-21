'use strict';

/**
 * OK or Not Found
 * 
 * determines if the data exists. If it does, send OK, else send notFound.
 */

module.exports = function sendOKOrNotFound(data, options) {
  // Get access to `req`, `res`, & `sails`
  var res = this.res;

  if (!data) {
    return res.notFound();
  } else {
    return res.ok(data, options);
  }
};