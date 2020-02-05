'use strict';

module.exports = (userid, id, contexts, model) => {
  let s = sails.sockets;
  let userRoom = SessionService.getUserRoom(userid);
  let pid = model.idToPidSync(id);
  let promises = [];
  contexts.forEach((context) => {
    let p = new Promise((resolve, reject) => {
      s.addRoomMembersToRooms(userRoom, model.room(pid, context), (err) => {
        if (err) return reject(err);
        return resolve('teswt');
      });
    });
    promises.push(p);
  });
  return Promise.all(promises);
};
