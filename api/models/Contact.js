'use strict';
var google = require('googleapis');
var googlePeople = google.people('v1');
var ews = require('node-ews');

/**
 * Contacts.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    firstname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    company: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    workNumber: {
      type: 'string',
    },
    homeNumber: {
      type: 'string'
    },
    cellNumber: {
      type: 'string'
    },
    notes: {
      type: 'string'
    },
    website: {
      type: 'string'
    },
    owner: {
      model: 'user',
      required: true
    },
    deletedAt: {
      type: 'datetime'
    }
  },
  /***********************
   *
   * List Contacts
   *
   ***********************/

  listContacts: function(integration, page, limit, search) {
    var ct = null;

    limit = limit || 10;
    switch (integration.provider) {
      case 'google':
        ct = Contact.listGCalContacts(integration, page, limit, search);
        break;
      case 'office365':
      case 'exchange':
        ct = Contact.listExchangeContacts(integration, page, limit, search);
        break;
      default:
        break;
    }

    return ct;
  },
  listGCalContacts: function(integration, page, limit, search) {
    var grabContacts = function(gAuth) {
      var query = {};
      if (search) {
        query.q = search;
      }
      if (page) {
        query['start-index'] = Number(page) + 1;
      }

      if (limit) {
        query['max-results'] = limit;
      }
      return GDataService.contacts.list(integration, gAuth, query).then(function(result) {
        return TransformerService.contact.sendGoogleContact(result.feed.entry, gAuth.credentials.access_token);
      });
    }

    return Integration.authGoogle(integration).then(grabContacts)
  },

  listExchangeContacts: function(integration, page, limit, search) {
    return Integration.authExchange(integration).then(function(exch) {
      if (!page) {
        page = 0;
      }
      var grabContacts = function() {
        var ewsFunction = "FindItem";

        var ewsArgs = {
          'attributes': {
            'Traversal': 'Shallow'
          },
          'ItemShape': {
            'BaseShape': 'AllProperties',
          },
          'IndexedPageItemView': {
            'attributes': {
              'MaxEntriesReturned': limit,
              'Offset': page,
              'BasePoint': 'Beginning'
            }
          },
          'ParentFolderIds': {
            'DistinguishedFolderId': {
              'attributes': {
                'Id': "contacts"
              }
            }
          },
          'QueryString': search,
        }

        return exch.run(ewsFunction, ewsArgs)
          .then(function(result) {
            if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items) {
              var contacts = result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.Contact;
              if (contacts) {
                if (Array.isArray(contacts)) {
                  return contacts;
                } else {
                  return [contacts];
                }
              } else {
                return null;
              }
            } else {
              return null;
            }

          })
          .catch(function(err) {
            console.log(err.message);
            if (err.message === "Basic Auth StatusCode 401: Unauthorized." || err.message.includes("Invalid or malformed wsdl file")) {
              throw {
                errorType: 'validation',
                response: {
                  'type': 'invalid',
                  'message': 'The integration details are invalid',
                  'integration': {
                    'email': integration.email,
                    'provider': integration.provider
                  }
                }
              };
            } else {
              return err.message;
            }
          });
      }

      return grabContacts()
        .then(TransformerService.contact.sendExchangeContact)
    });
  },

  /***********************
   *
   * Get Contact
   *
   ***********************/

  getContact: function(integration, id) {
    var gc = null;

    switch (integration.provider) {
      case 'google':
        gc = Contact.getGCalContact(integration, id);
        break;
      case 'office365':
      case 'exchange':
        gc = Contact.getExchangeContact(integration, id);
      default:
        break;
    }

    return gc;
  },
  getGCalContact: function(integration, id) {
    var grabContacts = function(gAuth) {
      return GDataService.contacts.get(integration, gAuth, id).then(function(result) {
        return TransformerService.contact.sendGoogleContact(result.entry);
      });
    }

    return Integration.authGoogle(integration).then(grabContacts)
  },
  getExchangeContact: function(integration, id) {
    return Integration.authExchange(integration).then(function(exch) {
      var grabContact = function(folder) {
        var ewsFunction = "GetItem";

        var ewsArgs = {
          'ItemShape': {
            'BaseShape': 'AllProperties',
          },
          'ItemIds': {
            'ItemId': {
              'attributes': {
                'Id': id
              }
            }
          }
        }

        return exch.run(ewsFunction, ewsArgs)
          .then(function(result) {
            if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items) {
              if (result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.Contact) {
                return result.ResponseMessages.FindItemResponseMessage.RootFolder.Items.Contact;
              } else {
                return null;
              }
            } else {
              return null;
            }

          })
          .catch(function(err) {
            console.log(err.message);
            return err.message;
          });
      }

      return grabContact()
        .then(TransformerService.contact.sendExchangeContact)
    });
  },
  /***********************
   *
   * Get Elastic Search
   *
   ***********************/
  afterCreate: function(created, cb) {
    cb();
    Search.create(created, created.id, 'contact').then(console.log).catch(console.error);
  },

  afterUpdate: function(updated, cb) {
    cb();

  },

  afterDestroy: function(deleted, cb) {
    cb();

  }
};

/**
 * @apiDefine contact
 *
 * @apiSuccess (Contact) {string} firstname
 * @apiSuccess (Contact) {string} lastname
 * @apiSuccess (Contact) {string} email
 * @apiSuccess (Contact) {string} phone
 * @apiSuccess (Contact) {string} notes
 * @apiSuccess (Contact) {User} owner
 */