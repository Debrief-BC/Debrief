'use strict';

var googleAuth = require('google-auth-library');
var google = require('googleapis');
var googleUser = google.people('v1');
var ews = require('node-ews');

module.exports = {
  attributes: {
    provider: {
      type: 'string',
      required: true
    },
    email: {
      'type': 'string'
    },
    username: {
      'type': 'string'
    },
    accountName: {
      type: 'string'
    },
    owner: {
      model: 'user'
    },
    code: {
      type: 'string'
    },
    domain: {
      type: 'string'
    },
    client: {
      type: 'string'
    },
    accessToken: {
      type: 'text'
    },
    refreshToken: {
      type: 'text'
    },
    clientId: {
      type: 'text'
    },
    clientSecret: {
      type: 'text'
    },
    redirectUrl: {
      type: 'text'
    }
  },
  initialAuth(integration) {
    switch (integration.provider) {
      case "google":
        return Integration
          .authGoogle(integration).then(function() {
            return integration;
          })
        break;
      case 'office365':
      case "exchange":
        return Integration.authExchange(integration).then(function() {
          return integration;
        });
        break;
      default:
        break;
    }
  },
  ensureUniqueness(integration) {

    return Integration.find({
        owner: integration.owner,
        provider: integration.provider,
        email: integration.email
      })
      .then(function(results) {
        if (results.length > 1) {
          return Integration.destroy({
            id: integration.id
          }).then(function() {
            Integration.ensureDefaultCalendar(integration.owner);
            throw {
              errorType: 'validation',
              response: {
                'type': 'existing',
                'message': 'this account is already synced for this provider',
                'integration': {
                  'email': integration.email,
                  'provider': integration.provider
                }
              }
            };
          });
        }
        return integration;
      });
  },
  authGoogle(integration) {
    return new Promise(function(resolve, reject) {
      var clientSecret = integration.clientSecret || sails.config.google.client_secret;
      var clientId = integration.clientId || sails.config.google.client_id;
      var redirectUrl = sails.config.google.redirect_url[integration.client];
      var auth = new googleAuth();
      console.log(clientId, clientSecret, redirectUrl);
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      if (integration.refreshToken && integration.accessToken) {
        oauth2Client.setCredentials({
          access_token: integration.accessToken,
          refresh_token: integration.refreshToken
        });
        return oauth2Client.refreshAccessToken(function(err, token) {
          if (err) return reject(err);
          // Update the Integration table
          Integration.update({
              id: integration.id
            }, {
              accessToken: oauth2Client.credentials.access_token,
              refreshToken: oauth2Client.credentials.refresh_token
            })
            .exec(function(err, res) {
              // done
            });

          if (!integration.email || integration.email == "") {
            Integration.getGoogleUser(integration, oauth2Client).then(function(res) {
              resolve(oauth2Client);
            }).catch(reject);
          } else {
            return resolve(oauth2Client);
          }
        });
      } else {
        return oauth2Client.getToken(integration.code, function(err, token) {
          if (err) {
            return reject(err);
          }

          oauth2Client.setCredentials({
            access_token: token.access_token,
            refresh_token: token.refresh_token
          });

          // Update the Integration table
          Integration.update({
              id: integration.id
            }, {
              accessToken: oauth2Client.credentials.access_token,
              refreshToken: oauth2Client.credentials.refresh_token
            })
            .exec(function(err, res) {
              // done
            });

          // Update Current User
          if (!integration.email || integration.email == "") {
            Integration.getGoogleUser(integration, oauth2Client).then(function(res) {
              resolve(oauth2Client);
            }).catch(reject);
          } else {
            return resolve(oauth2Client);
          }
        });
      }
    });
  },
  getGoogleUser(integration, auth) {
    return new Promise(function(resolve, reject) {
      googleUser.people.get({
        auth: auth,
        resourceName: 'people/me',
        personFields: 'names,emailAddresses'
      }, function(err, response) {
        if (err) {
          return reject(err);
        }
        var id = integration.id;

        for (var i = 0; i < response.emailAddresses.length; i++) {
          if (response.emailAddresses[i].metadata.primary) {
            integration.email = response.emailAddresses[i].value;
            integration.accountName = response.names[0].displayName;
            Integration.update({
                id: id
              }, {
                email: response.emailAddresses[i].value,
                accountName: response.names[0].displayName
              })
              .exec(function(err, res) {
                resolve(response);
              });
          }
        }
      });
    });
  },
  authExchange(integration) {

    var office365EwsConfig = {
      username: integration.email,
      password: integration.code,
      host: integration.domain,
      auth: 'basic'
    };

    var exchangeEwsConfig = {
      username: integration.username ? integration.username : integration.email,
      password: integration.code,
      host: integration.domain
    };

    var exch = new ews(integration.provider === "office365" ? office365EwsConfig : exchangeEwsConfig);

    return new Promise((resolve, reject) => {
      resolve(exch);
    }).catch((err) => {
      reject(err)
    });

  },
  revokeAccess(integration) {
    switch (integration.provider) {
      case "google":
        return Integration
          .authGoogle(integration)
          .then(Integration.revokeGoogle)
          .then(function() {
            return integration;
          });
        break;
      case 'office365':
      case "exchange":
        return Integration
          .authExchange(integration)
          .then(Integration.revokeExchange)
          .then(function() {
            return integration;
          });
        break;
      default:
        break;
    }
  },
  revokeGoogle(gAuth) {
    return new Promise((resolve, reject) => {
      gAuth.revokeCredentials((res) => {
        resolve();
      });
    });
  },
  revokeExchange(exchangeAuth) {
    return Integration.destroyAndPublish(exchangeAuth);
  },
  ensureDefaultCalendar(owner) {
    return Integration.find().where({
      owner: owner
    }).then((integrations) => {
      if (integrations.length > 0) {
        var integrationIds = _.pluck(integrations, 'id');
        return TeamUser.update({
          where: {
            user: owner,
            defaultCalendar: {
              '!': integrationIds
            }
          }
        }, {
          defaultCalendar: integrations[0].id,
          defaultContacts: integrations[0].id
        });
      } else {
        return TeamUser.update({
          where: {
            user: owner,
          }
        }, {
          defaultCalendar: 0,
          defaultContacts: 0
        });
      }
      return null;
    });
  }
};