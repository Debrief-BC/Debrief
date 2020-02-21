'use strict';

/**
 * General Error
 * 
 * Determines the type of error and accomodates it
 */

module.exports = function GeneralError(data, options) {
  // Get access to `req`, `res`, & `sails`
  var res = this.res;

  if (data) {
    if (data.errorType === 'validation') {
      return res.badRequest(data.response, options);
    } else if (data.errorType === 'authorization') {
      return res.unauthorized(data.response, options);
    } else if (data.errorType === 'forbidden') {
      return res.forbidden(data.response, options);
    }
    if (data.code == "E_VALIDATION") {
      var newData = {
        errorType: 'validation',
        response: {}
      };
      for (var attr in data.invalidAttributes) {
        newData.response[attr] = data.invalidAttributes[attr][0].message;
      }
      return res.badRequest(newData, options);
    }
    if (data.code == "not_found") {
      return res.notFound(null, options);
    }
  }
  return res.serverError(data, options);
};