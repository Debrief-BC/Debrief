'use strict';
/**
 * Conference.js
 * 
 * @description :: model abstraction for dealing with conferences
 */

module.exports = {
  connection: 'redis',
  attributes: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    media_server: {
      type: 'string'
    }
  },
  create: function(conf) {
    return new Promise(function(resolve, reject) {
      Conference.native(function(err, redis) {
        if (err) return reject(err);
        redis.set("room_" + conf.id, JSON.stringify(conf), function(err, res) {
          if (err) return reject(err);
          return resolve(res);
        });
      });
    });
  },
  find: function(id) {
    return new Promise(function(resolve, reject) {
      Conference.native(function(err, redis) {
        if (err) return reject(err);
        redis.get("room_" + id, function(err, res) {
          if (err) return reject(err);
          try {
            res = JSON.parse(res);
            return resolve(res);
          } catch (e) {
            return reject(e);
          }
        });
      });
    });
  },
  destroy: function(id) {
    return new Promise(function(resolve, reject) {
      Conference.native(function(err, redis) {
        if (err) return reject(err);
        redis.del("room_" + id, function(err, res) {
          if (err) return reject(err);
          return resolve(res);
        });
      });
    });
  },
  getRoomName: function(id) {
    return "conference_room_" + id;
  },
  sendCommand: function(cmd, conference_id, media_server) {
    cmd = 'conference room' + conference_id + ' ' + cmd;
    return FreeswitchService.eslCommand(cmd, media_server);
  },
  getList: function(conference_id, media_server) {
    return FreeswitchService.eslCommand("lua conference_list.lua " + conference_id, media_server);
  }
};