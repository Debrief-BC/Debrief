'use strict';

var request = require('request-promise');

module.exports = {
  createVisit: function(opts) {
    var auth = auth = "Basic " + new Buffer(sails.config.affiliate.user + ":" + sails.config.affiliate.password).toString("base64");

    var options = {
      uri: sails.config.affiliate.visitUrl + "?affiliate_id=" + opts.ref + "&ip=" + opts.ip + "&url=" + opts.url,
      method: 'POST',
      headers: {
        'User-Agent': 'Request-Promise',
        "Authorization": auth
      }
    };

    return request(options)
      .then(function(result) {
        console.log(result);
        return result;
      })
      .catch(function(err) {
        // API call failed...
        console.log(err);
        return err;
      });
  },

  createReferal: function(ref, team) {
    var auth = auth = "Basic " + new Buffer(sails.config.affiliate.user + ":" + sails.config.affiliate.password).toString("base64");

    var options = {
      uri: sails.config.affiliate.referalUrl + "?affiliate_id=" + ref + "&description=" + team.name,
      method: 'POST',
      headers: {
        'User-Agent': 'Request-Promise',
        "Authorization": auth
      }
    };

    return request(options)
      .then(function(result) {
        console.log(result);
        return JSON.parse(result);
      })
      .catch(function(err) {
        // API call failed...
        console.log(err);
        return err;
      });
  },

  getReferal: function(id) {
    var auth = auth = "Basic " + new Buffer(sails.config.affiliate.user + ":" + sails.config.affiliate.password).toString("base64");

    var options = {
      uri: sails.config.affiliate.referalUrl + id,
      method: 'GET',
      headers: {
        'User-Agent': 'Request-Promise',
        "Authorization": auth
      }
    };

    return request(options)
      .then(function(result) {
        console.log(result);
        return result;
      })
      .catch(function(err) {
        // API call failed...
        console.log(err);
        return err;
      });
  },

  updateReferal: function(opts) {
    var auth = auth = "Basic " + new Buffer(sails.config.affiliate.user + ":" + sails.config.affiliate.password).toString("base64");

    var options = {
      uri: sails.config.affiliate.referalUrl + opts.id + "?status=" + opts.status + "&description=" + opts.team.name,
      method: 'PATCH',
      headers: {
        'User-Agent': 'Request-Promise',
        "Authorization": auth
      }
    };

    return request(options)
      .then(function(result) {
        console.log(result);
        return result;
      })
      .catch(function(err) {
        // API call failed...
        console.log(err);
        return err;
      });
  },

};