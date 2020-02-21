'use strict';

var gcm = require('node-gcm');
var apn = require('apn');

var gcmSender = new gcm.Sender("AIzaSyDmgPngyQM3AV4vwJynzujqz4YzRXR2MwY");

let apn_certs = {
  dev: {
    token: {
      key: sails.config.apn.key,
      keyId: sails.config.apn.keyId,
      teamId: sails.config.apn.teamId
    },
    production: false
  },
  production: {
    token: {
      key: sails.config.apn.key,
      keyId: sails.config.apn.keyId,
      teamId: sails.config.apn.teamId
    },
    production: true
  }
}


var apnConnection = {
  dev: new apn.Provider(apn_certs.dev),
  production: new apn.Provider(apn_certs.production)
};

function sendAndroidNotification(ids, title, message, sound) {
  if (ids.length == 0) return;
  return new Promise(function(resolve, reject) {
    var msg = gcm.Message();

    msg.addData('title', title);
    msg.addData('soundname', 'beep.wav');

    for (var key in message) {
      msg.addData(key, message[key]);
    }

    return gcmSender.send(msg, ids, function(err, result) {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

function sendiOSNotification(env, ids, title, message, sound) {
  if (ids.length == 0) return;
  var msg = new apn.Notification();

  msg.expiry = Math.floor(Date.now() / 1000) + 3600;
  msg.badge = 1;
  msg.sound = sound;
  msg.alert = title;
  msg.topic = sails.config.apn.topic;

  msg.payload = {};
  msg.payload.title = title;

  for (var key in message) {
    msg.payload[key] = message[key];
  }

  var promises = [];

  ids.forEach(function(id) {
    promises.push(apnConnection[env].send(msg, id));
  });

  return Promise.all([]);
}

module.exports = {

  tableName: 'user_device',
  attributes: {
    user: {
      model: 'user'
    },
    registration_id: {
      type: 'string',
      required: true,
      unique: true
    },
    device_type: {
      type: 'string',
      required: true
    },
    debug: {
      type: 'boolean'
    },
    do_not_disturb: {
      type: 'boolean',
      defaultsTo: false
    },
    uuid: {
      type: 'string'
    },
    deletedAt: {
      type: 'datetime'
    }
  },
  sendNotification: function(user, from, team, notification_type, notification_text, params) {
    var title = notification_type;

    var message = {
      call_uuid: notification_text.call_uuid || null,
      teamId: team.id || team || null,
      timestamp: Date.now(),
      caller_id_name: from.caller_id_name || null,
      caller_id_number: from.caller_id_number || null,
      user: {
        id: from.user && from.user.user || null,
        firstname: from.user && from.user.firstname || null,
        lastname: from.user && from.user.lastname || null,
        extension: from.user && from.user.extension || [],
      },
      chat: {
        id: from.chat && from.chat.id || null,
        type: from.chat && from.chat.type || null,
        name: from.chat && from.chat.name || null,
        updatedAt: from.chat && from.chat.updatedAt || null,
        pin: from.chat && from.chat.pin || null,
      },
      body: {
        id: notification_text.id || null,
        body: notification_text.body || null,
        createdAt: notification_text.createdAt || null,
        filename: notification_text.filename || null,
        thumb_url: notification_text.thumb_url || null,
      }
    };

    if (notification_type == "chat_locked") {
      if (notification_text.body) {
        message.body.body = "1";
      } else {
        message.body.body = "0";
      }
    }

    if (params) {
      message[title] = params;
    }

    var sendAndroid = function(devices) {
      var ids = _.pluck(devices, 'registration_id');

      return sendAndroidNotification(ids, title, message);
    }

    var sendiOSDev = function(devices) {
      var ids = _.pluck(devices, 'registration_id');

      return sendiOSNotification('dev', ids, title, message);
    }

    var sendiOSProd = function(devices) {
      var ids = _.pluck(devices, 'registration_id');

      return sendiOSNotification('production', ids, title, message);
    }

    var send = function(msg) {
      message = msg;

      var andPromise = UserDevice.find({
        user: user,
        device_type: 'android',
        do_not_disturb: false
      }).then(sendAndroid);

      var iosDevPromise = UserDevice.find({
        user: user,
        device_type: 'ios',
        debug: true,
        do_not_disturb: false
      }).then(sendiOSDev);

      var iosProdPromise = UserDevice.find({
        user: user,
        device_type: 'ios',
        debug: false,
        do_not_disturb: false
      }).then(sendiOSProd);

      return Promise.all([andPromise, iosDevPromise, iosProdPromise]);
    };

    return TransformerService.userdevice.sendNotification(message).then(send);
  }
};

/**
 * @apiDefine device
 * @apiSuccess (Device) {string} registrationId
 * @apiSuccess (Device) {string} deviceType
 * @apiSuccess (Device) {bool} debug
 * @apiSuccess (Device) {bool} doNotDisturb
 * @apiSuccess (Device) {string} uuid
 * @apiSuccess (Device) {integer} unseenNotifications
 * @apiSuccess (Device) {integer} id
 */