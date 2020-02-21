'use strict';

var Validation = require('validator');
var Validator = require('./Validator');

module.exports = {
  async validateBackup(req, user) {
    try {
      let response = {};

      if (!user) {
        response.role = 'You do not have permission.';
      } else {
        const requiredFields = ['id', 'filenames', 'filehashs', 'filesizes', 'chats'];

        for (let field of requiredFields) {
          if (!req.param(field)) {
            response[field] = `${field} is a required paramater.`;
          }
        }

        if (user.storageUsed >= user.totalStorage) {
          response.storage_used = 'No storage remaining.';
        }
      }
      return Validator.respond(response);
    } catch (err) {
      return Validator.respond(err.response || err.message);
    }
  },
};
