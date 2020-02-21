'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'id',
        value: Contact.idToPid
      },
      'firstname': {
        key: 'first_name'
      },
      'lastname': {
        key: 'last_name'
      },
      'email': {
        key: 'email'
      },
      'workNumber': {
        key: 'work_number'
      },
      'homeNumber': {
        key: 'home_number'
      },
      'cellNumber': {
        key: 'cell_number'
      },
      'otherNumbers': {
        key: 'other_numbers'
      },
      'notes': {
        key: 'notes'
      },
      'website': {
        key: 'website'
      },
      'company': {
        key: 'company'
      },
      'owner': {
        key: 'owner',
        value: TransformerService.user.sendUserOrPid
      },
      'avatar': 'avatar',
      'remote_id': 'remote_id',
      'metadata': 'metadata',
      'address': 'address',
      '_nextpage': '_nextpage'
    });
  },
  get: function(req) {

    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: Contact.pidToId
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
      'company': {
        key: 'company'
      },
      'work_number': {
        key: 'workNumber'
      },
      'home_number': {
        key: 'homeNumber'
      },
      'cell_number': {
        key: 'cellNumber'
      },
      'other_numbers': {
        key: 'otherNumbers'
      },
      'notes': {
        key: 'notes'
      },
      'website': {
        key: 'website'
      },
      'owner': {
        key: 'owner'
      },
      'integration': {
        key: 'integration',
        value: Integration.pidToId
      },
      'remoteid': 'remoteid'
    });
  },
  sendGoogleContact: function(data, access_token) {
    return Transformer.build(data, {
      'id': {
        key: 'remote_id',
        value: function(id) {
          if (id.length > 0) {
            var id_parts = id[0].split('/');
            return id_parts[id_parts.length - 1];
          } else {
            return null;
          }
        }
      },
      'gd:name': {
        key: 'firstname',
        value: function(names, newobj) {
          if (!names || names.length == 0 || !names[0]['gd:givenName']) return "";
          newobj.lastname = names[0]['gd:familyName'] ? names[0]['gd:familyName'][0] : '';
          return names[0]['gd:givenName'][0];
        }
      },
      'gd:email': {
        key: 'email',
        value: function(emails) {
          if (!emails || emails.length == 0) return "";
          var rtn = emails[0].$.address;
          emails.forEach(function(email) {
            if (email.$.primary) {
              rtn = email.$.address;
            }
          });
          return rtn;
        }
      },
      'gd:phoneNumber': {
        key: 'workNumber',
        value: function(numbers, newobj) {
          if (!numbers || numbers.length == 0) return "";

          if (Array.isArray(numbers)) {
            var otherNumbers = [];

            numbers.forEach(function(number) {
              if (number.$.rel && number.$.rel.endsWith("work")) {
                rtn = (number.$ && number.$.uri) ? number.$.uri.replace('tel:', '').replace('+', '') : number._;
              } else if (number.$.rel && number.$.rel.endsWith("mobile")) {
                newobj.cellNumber = (number.$ && number.$.uri) ? number.$.uri.replace('tel:', '').replace('+', '') : number._;
              } else if (number.$.rel && number.$.rel.endsWith("home")) {
                newobj.homeNumber = (number.$ && number.$.uri) ? number.$.uri.replace('tel:', '').replace('+', '') : number._;
              } else {
                var num = (number.$ && number.$.uri) ? number.$.uri.replace('tel:', '').replace('+', '') : number._;
                otherNumbers.push(num);
              }
            });
            newobj.otherNumbers = otherNumbers;

            return rtn;

          } else {
            var rtn = (numbers.$ && numbers.$.uri) ? numbers.$.uri.replace('tel:', '') : numbers._;
            return rtn.replace('+', '');
          }
        }
      },
      'link': {
        key: 'avatar',
        value: function(links) {
          if (!links || links.length == 0) return null;
          var rtn = null;
          links.forEach(function(link) {
            if (link.$ && link.$.rel == 'http://schemas.google.com/contacts/2008/rel#photo' && link.$.type == 'image/*' && link.$['gd:etag']) {
              rtn = link.$.href + "&access_token=" + access_token;
            }
          });
          return rtn;
        }
      },
      'gd:structuredPostalAddress': {
        key: 'address',
        value: function(addresses) {
          if (!addresses || addresses.length == 0 || !addresses[0]['gd:formattedAddress'] || !addresses[0]['gd:formattedAddress'][0]) return null;
          return addresses[0]['gd:formattedAddress'][0];
        }
      }
    });
  },
  sendExchangeContact: function(data, access_token) {
    return Transformer.build(data, {
      'ItemId': {
        key: 'remote_id',
        value: function(id) {
          if (id.attributes) {
            return id.attributes.Id;
          }
        }
      },
      'CompleteName': {
        key: 'firstname',
        value: function(names, newobj) {
          if (!names || !names['FirstName']) return "";
          newobj.lastname = names['LastName'];
          return names['FirstName'];
        }
      },
      'EmailAddresses': {
        key: 'email',
        value: function(emails) {
          if (!emails.Entry) return "";
          if (Array.isArray(emails.Entry)) {
            return emails.Entry[0].$value;
          } else {
            return emails.Entry.$value;
          }
        }
      },
      'PhoneNumbers': {
        key: 'workNumber',
        value: function(numbers, newobj) {
          if (!numbers.Entry) return "";
          if (Array.isArray(numbers.Entry)) {
            var rtn = numbers.Entry[0].$value;
            var otherNumbers = [];
            numbers.Entry.forEach(function(number) {
              if (number.attributes.Key === "BusinessPhone") {
                rtn = number.$value
              } else if (number.attributes.Key === "MobilePhone") {
                newobj.cellNumber = number.$value;
              } else if (number.attributes.Key === "HomePhone") {
                newobj.homeNumber = number.$value;
              } else {
                var num = number.$value;
                otherNumbers.push(num);
              }
            });

            newobj.otherNumbers = otherNumbers;
            return rtn;
          } else {
            return numbers.Entry.$value;
          }
        }
      },
      'BusinessHomePage': {
        key: 'website'
      },
      'CompanyName': {
        key: 'company'
      }
    });
  }
};