'use strict';

const crypto = require('crypto');

module.exports = {
  settings: {
    algorithm: sails.config.encryption && sails.config.encryption.algorithm || 'aes192',
    password: sails.config.encryption && sails.config.encryption.password || 'password'
  },
  encode: function(data, options) {
    options = options || {};
    var algorithm = options.algorithm || this.settings.algorithm;
    var password = options.password || this.settings.password;
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(data.toString(), 'utf8', 'hex');
    crypted += cipher.final('hex');
    crypted = "a" + crypted;
    return crypted;
  },
  decode: function(original, options) {
    var crypted = original.substr(1);
    options = options || {};
    var algorithm = options.algorithm || this.settings.algorithm;
    var password = options.password || this.settings.password;
    var decipher = crypto.createDecipher(algorithm, password);
    var data = decipher.update(crypted, 'hex', 'utf8');
    data += decipher.final('utf8');
    return data;
  }
};