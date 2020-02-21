'use strict';

var socketUsers = {}
module.exports = {
  getCurrentId(req) {
    return new Promise(function(resolve, reject) {
      if (req.isSocket) {
        var user = this.getUserBySocket(req.socket);
        if (user) {
          return resolve(user);
        } else {
          return reject('no user found');
        }
      } else {
        var pid = req.headers.authorization.split(' ')[1];
        if (pid) {
          return User.pidToId(pid).then(function(id) {
            return resolve(id);
          }).catch(reject);
        } else {
          return reject();
        }
      }
    });
  },
  registerSocket(socket, id) {
    if (socket !== null) {
      socketUsers[socket.id] = id;
      sails.sockets.join(socket, this.getUserRoom(id));
    }
  },
  unregisterSocket(socket) {
    sails.sockets.leaveAll(socket, this.getUserRoom(socketUsers[socket.id]));
    delete socketUsers[socket.id];
  },
  getUserBySocket(socket) {
    if (socketUsers[socket.id]) {
      return socketUsers[socket.id];
    }
    return null;
  },
  getUserRoom(userid) {
    return 'user_only_room_' + userid;
  }
}