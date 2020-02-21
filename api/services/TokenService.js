'use strict';

/**
 * Verify Token
 *
 * Checks in a redis store for a token and return authorized if there's one.
 * @param  {string} token an oauth token from the user
 * @return {string}       user's pid
 */
module.exports.verify = function(token) {
  return new Promise(function(resolve, reject) {
    Session.native(function(err, result) {
      if (err) reject(err);
      result.get(token, function(err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });
  }).catch(function(err) {
    reject(err);
  });
}