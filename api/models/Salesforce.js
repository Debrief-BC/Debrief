'use strict';

var jsforce = require('jsforce');
var conn = new jsforce.Connection();

module.exports = {
  find: function(type, conditions, fields) {
    return conn.login(sails.config.salesforce.username, sails.config.salesforce.password).then(
      function(res) {
        return conn.sobject(type).find(conditions, fields, function(err, result) {
          if (err) {
            console.error(err);
          };
          return result;
        });
      }
    );
  },
  findOne: function(type, conditions, fields) {
    return conn.login(sails.config.salesforce.username, sails.config.salesforce.password).then(
      function(res) {
        return conn.sobject(type).findOne(conditions, fields, function(err, result) {
          if (err) {
            console.error(err);
          };
          return result;
        });
      }
    );
  },
  create: function(lead) {
    return conn.login(sails.config.salesforce.username, sails.config.salesforce.password).then(
      function(res) {
        return conn.insert(lead, function(err, result) {
          if (err) {
            return console.error(err);
          };
          return result;
        });
      });
  },
  createContact: function(accountName, contact) {
    return conn.login(sails.config.salesforce.username, sails.config.salesforce.password).then(
      function(res) {
        return conn.sobject("Account").find({
          'Account.Name': accountName
        }).then(function(account) {
          contact.AccountId = account[0].Id;
          contact.type = 'Contact';
          conn.insert(contact, function(err, result) {
            if (err) {
              return console.error(err);
            };

            return result;
          });
        })
      });
  },
  update: function(type, conditions, updates) {
    return conn.login(sails.config.salesforce.username, sails.config.salesforce.password).then(
      function(res) {
        return conn.sobject(type).find(conditions)
          .update(updates, function(err, result) {
            if (err) {
              console.error(err);
            };
            return result;
          });
      }
    );
  },
  destroy: function(type, id) {
    return conn.login(sails.config.salesforce.username, sails.config.salesforce.password).then(
      function(res) {
        return conn.sobject(type).destroy(id, function(err, result) {
          if (err) {
            console.error(err);
          };
          return result;
        });
      }
    );
  }

};