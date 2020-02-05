'use strict';

var crypto = require('crypto');

module.exports = {
  createHash: function(email) {
    var hmac = crypto.createHmac('sha256', sails.config.intercom.key);
    hmac.update(email);
    return {
      'hash': hmac.digest('base64')
    };
  }
}