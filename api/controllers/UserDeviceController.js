'use strict';

module.exports = {
  /**
   * @api {post} /user/:id/devices
   * @apiVersion 2.3.15
   * @apiName AddUserDevice
   * @apiGroup User
   *
   * @apiDescription this adds a device to a user. Note - if a device with the registration_id exits it still returns ok.
   * @apiParam id the user's unique id
   * @apiParam (body) {Device} body the object representing the device
   *
   * @apiUse device
   */

  createDevice(req, res) {
    let Transform = TransformerService.userdevice.get(req);

    let findExisting = () => {
      return UserDevice.findOne({
        user: req.user,
        registration_id: req.param('registration_id')
      });
    }

    let createDevice = (found) => {
      if (found) {
        return found;
      } else {
        let device = req.body;
        device.user = req.user;
        return UserDevice.create(device);
      }
    };

    ValidatorService.userdevice.validateCreate(req)
      .then(Transform)
      .then(findExisting)
      .then(createDevice)
      .then(TransformerService.userdevice.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {post} /user/:id/devices/notification
   * @apiVersion 2.3.15
   * @apiName NotifyUserDevice
   * @apiGroup User
   *
   * @apiDescription this sends a notification to a users devices
   *
   * @apiParam id the user's unique id
   * @apiParam team_slug the slug for the team from which the notification is sent
   * @apiParam type the type of notification. Can be 'call', 'missed_call', 'chat_message', 'chat_invite'
   * @apiParam call_uuid the uuid of the other branch of the call.
   * @apiParam {FROM} from an object defining who the notification is from.
   *
   * @apiParam (FROM) [user] the user id for the user from which this notification is coming
   * @apiParam (FROM) [chat] the chat id for the chat from which this notification is coming
   * @apiParam (FROM) [caller_id_number] the caller_id_number from which this notification is coming
   * @apiParam (FROM) [caller_id_name] the caller_id_name from which this notification is coming
   */
  sendNotification(req, res) {

    let Transform = () => {
      return TransformerService.userdevice.getNotification(req);
    }

    let fillFrom = () => {
      let promises = [];
      let from = req.param('from');

      if (from.user) {
        let tu = TeamUser.findOne({
            user: from.user,
            team: req.param('team').id,
            deletedAt: null
          })
          .then((user) => {
            from.user = user;
          });
        promises.push(tu);
      }

      if (from.chat) {
        let ch = Chat.findOne({
            id: from.chat
          })
          .then((chat) => {
            from.chat = chat;
          });
        promises.push(ch);
      }

      return Promise.all(promises).then(() => {
        return from;
      });
    };

    let sendNotification = (from) => {
      let user = req.param('id');
      let type = req.param('type');
      let team = req.param('team');
      let body = {};

      if (req.isSuperAdmin && req.param('body')) {
        body.body = req.param('body');
      }

      if (req.param('call_uuid')) body.call_uuid = req.param('call_uuid');

      return UserDevice.sendNotification(user, from, team, type, body);
    };


    ValidatorService.userdevice.validateNotification(req)
      .then(Transform)
      .then(fillFrom)
      .then(sendNotification)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /user/:id/devices/:registration_id
   * @apiVersion 2.3.15
   * @apiName EditUserDevice
   * @apiGroup User
   *
   * @apiDescription this edits a device owned by a user
   * @apiParam id the user's unique id
   * @apiParam registration_id the device's unique id
   * @apiParam (body) {Device} body the object representing the device, or part of it
   *
   * @apiUse device
   */

  updateDevice(req, res) {
    let updateDevice = () => {
      let device = req.body;
      let find = {
        user: req.param('id'),
        registration_id: req.param('registration_id')
      };
      return UserDevice.update(find, device);
    };

    ValidatorService.userdevice.validateUpdate(req)
      .then(
        TransformerService.userdevice.get(req)
        .then(updateDevice)
        .then(TransformerService.userdevice.send)
        .then(res.okOrNotFound)
        .catch(res.serverError)
      ).catch(res.badRequest);
  },


  /**
   * @api {delete} /user/:id:/devices/:registration_id
   * @apiVersion 2.3.15
   * @apiName RemoveUserDevice
   * @apiGroup User
   *
   * @apiDescription this removes a device owned by a user
   * @apiParam id the user's unique id
   * @apiParam deviceid the device's unique id
   */

  destroyDevice(req, res) {
    TransformerService.userdevice.get(req).then(() => {
      let find = {
        user: req.param('id'),
        registration_id: req.param('registration_id')
      };
      return UserDevice.destroy(find).then(() => {
        return res.ok();
      });
    }).catch(res.serverError);
  },
}