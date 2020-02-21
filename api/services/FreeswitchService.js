'use strict';
var esl = require('modesl');

module.exports = {
  eslCommand: function(cmd, media_server) {
    return new Promise(function(resolve, reject) {
      var conn = new esl.Connection(media_server, 8021, sails.config.freeswitch.password, function() {
        conn.api(cmd, function(res) {
          resolve(res);
          conn.disconnect();
        });
      });
      conn.on('error', function(err) {
        reject(err);
      });
      conn.recvEvent(function(evt) {
        if (evt.headers[0].name == "Content-Type" && (evt.headers[0].value == "text/rude-rejection") || evt.type == 'error') {
          reject(evt);
          conn.disconnect();
        }
      });
    });
  }
}