'use strict';

const Transformer = require('./Transformer');

module.exports = {
  get(req) {
    if (req && req.body) {
      req.body.owner = req.user;
    }

    if (req.body && typeof req.body.code === 'object') {
      req.body.email = req.body.code.email;
      req.body.domain = req.body.code.server_url;
      req.body.code = req.body.code.password;
    }

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Integration.pidToId
      },
      'first_name': {
        key: 'firstname'
      },
      'last_name': {
        key: 'lastname'
      },
      'email': {
        key: 'email'
      },
      'username': {
        key: 'username'
      },
      'domain': {
        key: 'domain',
        value: function(domain, newObj, srcobj) {
          if (srcobj.provider === "office365") {
            return "https://outlook.office365.com";
          } else {
            return domain;
          }
        }
      },
      'provider': {
        key: 'provider'
      },
      'type': {
        key: 'type'
      },
      'access_token': {
        key: 'accessToken'
      },
      'refresh_token': {
        key: 'refreshToken'
      },
      'code': {
        key: 'code'
      },
      'owner': {
        key: 'owner'
      },
      'client': {
        key: 'client'
      },
      'client_id': {
        key: 'clientId'
      },
      'client_secret': {
        key: 'clientSecret'
      },
      'redirect_url': {
        key: 'redirectUrl'
      }
    });
  },
  sendIntegrationOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object' && !Array.isArray(data)) {
      return TransformerService.integration.send(data);
    } else {
      return Integration.idToPid(data);
    }
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Integration.idToPid
      },
      'provider': {
        key: 'provider'
      },
      'type': {
        key: 'type'
      },
      'owner': {
        key: 'owner',
        value: User.idToPid
      },
      'email': {
        key: 'email'
      },
      'accountName': {
        key: 'account_name'
      }
    });
  }
};