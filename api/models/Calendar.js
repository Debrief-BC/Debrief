'use strict';

var google = require('googleapis');
var outlook = require('node-outlook');

var googleCal = google.calendar('v3');
var googleUser = google.people('v1');

module.exports = {
  attributes: {
    integration: {
      model: 'integration'
    },
    calendarId: {
      type: 'string'
    }
  },
  defaultPopulate: ['integration'],
  createCalendar(integration) {
    switch (integration.provider) {
      case 'google':
        this.createGoogleCalendar(integration);
        break;
      case 'office365':
      case 'exchange':
        this.createExchangeCalendar();
        break;
      default:
        break;
    }
  },
  createGoogleCalendar(integration) {
    Integration.authGoogle(integration).then(function(gAuth) {
      var id = integration.id;

      Calendar.getCurrentUser(id, gAuth);

      Calendar.findOne({
        integration: id
      }).then(function(integration) {

        if (!integration.calendarId) {
          var calendarId;

          var createCalendar = function() {
            return new Promise(function(resolve, reject) {
              googleCal.calendars.insert({
                auth: gAuth,
                resource: {
                  summary: 'Debrief Calendar',
                  time_zone: sails.config.default_timezone.google
                }
              }, function(err, response) {
                if (err) {
                  console.log('Could not create calendar', err);
                  return reject(err);
                }

                return resolve(response);
              });
            });
          };

          var createLocalCalendarRecord = function(result) {
            return Calendar.create({
              integration: id,
              calendarId: result.id
            }).then(function(res) {
              return res;
            }).catch(function(err) {
              console.log('createRecord:err', err);
            });
          };

          return createCalendar().then(createLocalCalendarRecord);
        }

      }).catch(function(err) {
        console.log('calendar function err', err);
      });

    }).catch(function(err) {
      console.log('err', err);
    });
  },
  createExchangeCalendar(integration) {
    Integration.authExchange(integration).then(function(result) {
      var id = integration.id;

      Calendar.findOne({}).then(function() {

      });

    });

  },
  getRemoteCalendar(calendar, start_date, end_date) {
    var integration = calendar.integration;
    switch (integration.provider) {
      case 'google':
        return Event.listGCalEvents(integration, calendar, start_date, end_date);
        break;
      case 'office365':
      case 'exchange':
        return Event.listExchangeEvents(integration, calendar, start_date, end_date);
        break;
      default:
        return calendar;
        break;
    }
  },
  getCurrentUser(id, auth) {
    googleUser.people.get({
      auth: auth,
      resourceName: 'people/me'
    }, (err, response) => {
      if (err) {
        console.log('people err', err);
      }

      for (var i = 0; i < response.emailAddresses.length; i++) {
        if (response.emailAddresses[i].metadata.primary) {
          Integration.update({
              id: id
            }, {
              email: response.emailAddresses[i].value,
              accountName: response.names[0].displayName
            })
            .exec(function(err, res) {
              // done
            });
        }
      }

      return response;
    });
  }

};