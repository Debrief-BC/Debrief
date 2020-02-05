'use strict';

module.exports = (userid, id, contexts, model) => {
  let s = sails.sockets;
  let userRoom = SessionService.getUserRoom(userid);
  let pid = model.idToPidSync(id);

  contexts.forEach((context) => {
    let room = model.room(pid, context);
    s.removeRoomMembersFromRooms(userRoom, room);
  });
}
