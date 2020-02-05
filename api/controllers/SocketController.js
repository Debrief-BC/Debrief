'use strict';

module.exports = {
  /**
   * @api {socket-get} /socket/register
   * @apiVersion 2.3.15
   * @apiName RegisterSocket
   * @apiGroup Socket
   *
   * @apiDescription This registers the current socket for changes to a specific user.
   */
  register(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }
    SessionService.registerSocket(req.socket, req.user);
    User.subscribe(req.socket, req.user, ['message', 'update', 'destroy', 'add:chats', 'remove:chats', 'add:teams', 'remove:teams', 'add:favorites', 'remove:favorites', 'add:notifications']);
    return res.ok();
  },

  /**
   * @api {socket-get} /socket/unregister
   * @apiVersion 2.3.15
   * @apiName UnregisterSocket
   * @apiGroup Socket
   *
   * @apiDescription This unregisters the current socket for changes to a specific user.
   */
  unregister(req, res) {
    if (!req.isSocket || req.param('pid') === null) {
      return res.badRequest();
    }

    User.unsubscribe(req.socket, SessionService.getUserBySocket(req.socket));
    SessionService.unregisterSocket(req.socket);
    return res.ok();
  }
}