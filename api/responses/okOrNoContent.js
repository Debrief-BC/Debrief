'use strict';

/**
 * OK or No Content
 * 
 * determines if the data exists. If it does, send OK, else send No Content.
 */

module.exports = function sendOKOrNoContent(data, options) {
  // Get access to `req`, `res`, & `sails`
  var res = this.res;

  if (!data) {
    return res.noContent();
  } else {
    return res.ok(data, options);
  }
};