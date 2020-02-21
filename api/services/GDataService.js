/*********************************
 * 
 * 
 *  Provides access to google GData apis (ex. contacts)
 * 
 * 
 * ******************************/

var rp = require('request-promise');
var xml2js = require('xml2js');
var endpoints = {
  contacts: 'https://www.google.com/m8/feeds/contacts/{userEmail}/full',
  contactimage: 'https://www.google.com/m8/feeds/photos/media/{userEmail}'
}

function makeRequest(integration, gAuth, method, url, dataType, queryparams, postData) {
  var fullpath = url.replace('{userEmail}', integration.email);

  queryparams = queryparams || {};
  queryparams.v = '3.0';

  var headers = {
    'Authorization': 'Bearer ' + gAuth.credentials.access_token
  };

  if (dataType) {
    headers['Content-Type'] = 'application/' + dataType;
  }

  // build options object
  var opts = {
    uri: fullpath,
    headers: headers,
    qs: queryparams,
    method: method,
    resolveWithFullResponse: true
  };

  return rp(opts).then(function(result) {
    if (result.statusCode >= 200 && result.statusCode < 300) {
      return new Promise(function(resolve, reject) {
        xml2js.parseString(result.body, function(err, result) {
          if (err) reject(err);
          resolve(result);
        });
      });
    }
    throw result;
  });
}

module.exports = {
  contacts: {
    get: function(integration, gAuth, contactid) {
      return makeRequest(integration, gAuth, 'GET', endpoints.contacts + '/' + contactid);
    },
    list: function(integration, gAuth, queryparams) {
      return makeRequest(integration, gAuth, 'GET', endpoints.contacts, null, queryparams);
    },
    getPhoto: function(integration, gAuth, uri) {
      return makeRequest(integration, gAuth, 'GET', uri);
    }
  }
}