'use strict';

/**
 * ConferenceController
 *
 * @description :: Server-side logic for managing conferences
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var confsVideoPresented = [];

module.exports = {
  /**
   * @api {get} /conference/:id
   * @apiVersion 2.3.15
   * @apiName GetConference
   * @apiGroup Conference
   *
   * @apiDescription Gets the participant info for a bridged conference.
   * @apiParam id the bridge id.
   */
  findOne: function(req, res) {
    return Conference
      .find(req.param('id'))
      .then(function(conf) {
        if (req.isSocket) sails.sockets.join(req, Conference.getRoomName(req.param('id')));
        if (!conf) return null;
        return Conference.getList(req.param('id'), conf.media_server)
          .then(function(rtn) {
            var users = JSON.parse(rtn.body);
            var users_by_id = {};
            users.forEach(function(user) {
              if ((/^([a-zA-Z0-9]{20,})$/).test(user.caller_id_number)) {
                try {
                  var id = User.pidToIdSync(user.caller_id_number)
                  if (users_by_id[id]) {
                    users.splice(users.indexOf(user), 1);
                    var org = users_by_id[id];
                    if (!Array.isArray(org.conference_user_id)) {
                      org.conference_user_id = [org.conference_user_id];
                    }
                    org.conference_user_id.push(user.conference_user_id);
                    org.conference_status = _.union(org.conference_status, user.conference_status);
                  } else {
                    users_by_id[id] = user;
                  }
                } catch (e) {}
              }
            });
            return User.find({
                id: Object.keys(users_by_id)
              })
              .then(function(usrs) {
                usrs.forEach(function(user) {
                  if (users_by_id[user.id]) {
                    users_by_id[user.id].user = user;
                  }
                });

                return {
                  conf: conf.id,
                  users: users
                };
              });
          });
      })
      .then(TransformerService.conference.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /conference/:id/leave
   * @apiVersion 2.3.15
   * @apiName LeaveConference
   * @apiGroup Conference
   *
   * @apiDescription Unsubscribes from updates about the conference.
   * @apiParam id the bridge id.
   */
  leave: function(req, res) {
    res.ok();
    if (req.isSocket) sails.sockets.leave(req, Conference.getRoomName(req.param('id')));
  },

  /**
   * @api {post} /conference/:id/kick/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName KickUser
   * @apiGroup Conference
   *
   * @apiDescription Kicks a user from a conference.
   * @apiParam id the bridge id.
   * @apiParam conf_usr_id the user's conference id
   */
  kick: function(req, res) {
    return Conference
      .find(req.param('id'))
      .then(function(conf) {
        if (!conf) return null;
        return Conference.sendCommand("kick " + req.param('conf_usr_id'), req.param('id'), conf.media_server)
          .then(function(result) {
            if (!(/^OK.*/).test(result.body)) throw ({
              error: result.body
            });
            return {
              body: result.body
            };
          });
      })
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /conference/:id/floor/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName GrantFloor
   * @apiGroup Conference
   *
   * @apiDescription Grants a user floor
   * @apiParam id the bridge id.
   * @apiParam conf_usr_id the user's conf_usr_id
   */
  floor: function(req, res) {
    return Conference
      .find(req.param('id'))
      .then(function(conf) {
        if (!conf) return null;
        return Conference.sendCommand("floor " + req.param('conf_usr_id') + " force", req.param('id'), conf.media_server)
          .then(function(result) {
            if (!(/^OK.*/).test(result.body)) throw ({
              error: result.body
            });
            return {
              body: result.body
            };
          });
      })
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /conference/:id/video-floor/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName GrantFloor
   * @apiGroup Conference
   *
   * @apiDescription Grants a user video floor
   * @apiParam id the bridge id.
   * @apiParam conf_usr_id the user's conf_usr_id
   */
  vidfloor: function(req, res) {
    return Conference
      .find(req.param('id'))
      .then(function(conf) {
        if (!conf) return null;
        return Conference.sendCommand("vid-floor " + req.param('conf_usr_id') + " force", req.param('id'), conf.media_server)
          .then(function(result) {
            if (!(/^[+]?OK.*/).test(result.body)) throw ({
              error: result.body
            });
            return {
              body: result.body
            };
          });
      })
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /conference/:id/video
   * @apiVersion 2.3.15
   * @apiName video
   * @apiGroup Conference
   *
   * @apiDescription notify all participant video state
   * @apiParam id the conference id.
   * @apiParam {action: start|stop, presenter_id: user_pid}
   */
  setVideoState: function(req, res) {
    var validAction = /^start$|^stop$/;
    var conferencId = req.param('id');
    var presenterId = req.body.presenter_id;
    var action = req.body.action;
    if (!action.match(validAction)) {
      return res.notFound('Invalid action');
    }
    if (!presenterId) {
      return res.notFound('missing presenterId');
    }
    res.ok();
    return Conference
      .find(conferencId)
      .then(function(conf) {
        if (!conf) {
          return null;
        }
        if (action === 'start') {
          confsVideoPresented[conf.id] = true;
        } else {
          confsVideoPresented[conf.id] = false;
        }
        sails.sockets.broadcast(Conference.getRoomName(conf.id), 'conference', {
          verb: 'video-' + action,
          conference_id: conf.id,
          presenter_id: presenterId
        });
      })
      .catch(res.serverError);
  },

  /**
   * @api {post} /conference/:id/mute/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName MuteUser
   * @apiGroup Conference
   *
   * @apiDescription Mutes a user
   * @apiParam id the bridge id.
   * @apiParam conf_usr_id the user's conf_usr_id
   */
  mute: function(req, res) {
    return Conference
      .find(req.param('id'))
      .then(function(conf) {
        if (!conf) return null;
        return Conference.sendCommand("mute  " + req.param('conf_usr_id'), req.param('id'), conf.media_server)
          .then(function(result) {
            if (!(/^OK.*/).test(result.body)) throw ({
              error: result.body
            });
            return {
              body: result.body
            };
          });
      })
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /conference/:id/unmute/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName UnMuteUser
   * @apiGroup Conference
   *
   * @apiDescription UnMutes a user
   * @apiParam id the bridge id.
   * @apiParam conf_usr_id the user's conf_usr_id
   */
  unmute: function(req, res) {
    return Conference
      .find(req.param('id'))
      .then(function(conf) {
        if (!conf) return null;
        return Conference.sendCommand("unmute  " + req.param('conf_usr_id'), req.param('id'), conf.media_server)
          .then(function(result) {
            if (!(/^OK.*/).test(result.body)) throw ({
              error: result.body
            });
            return {
              body: result.body
            };
          });
      })
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },


  /**
   * @api {post} /conference/:id/start_recording/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName StartRecording
   * @apiGroup Conference
   *
   * @apiDescription Starts a recording of a conference
   * @apiParam id the bridge id.
   */
  start_recording: function(req, res) {

    return Conference
      .find(req.param('id'))
      .then(function(conf) {

        if (!conf) return null;
        return Conference.sendCommand("recording start /tmp/room" + req.param('id') + "@" + (new Date()).getTime() + ".mp4", req.param('id'), conf.media_server)
          .then(function(result) {

            if (!(/^OK.*/).test(result.body)) throw ({
              error: result.body
            });

            return {
              body: result.body
            };

          });

      })
      .then(res.okOrNotFound)
      .catch(res.serverError);

  },


  /**
   * @api {post} /conference/:id/stop_recording/:conf_usr_id
   * @apiVersion 2.3.15
   * @apiName StopRecording
   * @apiGroup Conference
   *
   * @apiDescription Stops the recording of a conference
   * @apiParam id the bridge id.
   */
  stop_recording: function(req, res) {

    return Conference
      .find(req.param('id'))
      .then(function(conf) {

        if (!conf) return null;
        return Conference.sendCommand("recording stop all", req.param('id'), conf.media_server)
          .then(function(result) {

            if (!(/^OK.*/).test(result.body)) throw ({
              error: result.body
            });

            return {
              body: result.body
            };

          });
      })
      .then(res.okOrNotFound)
      .catch(res.serverError);

  },


  /**
   * @api {post} /conference/:id/fs_event
   * @apiVersion 2.3.15
   * @apiName Fs_Event
   * @apiGroup Conference
   *
   * @apiDescription provides a freeswitch update to the conference
   * @apiParam id the bridge id.
   * @apiParam conf_usr_id the user's conf_usr_id
   */
  fs_event: function(req, res) {

    res.ok();
    var socket_event = req.param('data');
    var event_type = req.param('type');

    function process_event(type, data) {
      return new Promise(function(resolve, reject) {

        if ((/^([a-zA-Z0-9]{20,})$/).test(data.caller_id_number)) {
          var id = User.pidToIdSync(data.caller_id_number);
          return User.findOne(id)
            .then(TransformerService.user.send)
            .then(function(user) {
              data.user = user;
              return resolve(data);
            })
            .catch(reject);
        }

        return resolve(data);
      });
    }

    process_event(event_type, socket_event).then(function(event_data) {
        socket_event.conference_id = req.param('id');
        socket_event.verb = event_type;
        socket_event.videoPresented = confsVideoPresented[req.param('id')];
        // console.log(event_data);
        sails.sockets.broadcast(Conference.getRoomName(req.param('id')), 'conference', event_data);
      })
      .catch(function(err) {
        // console.error(err);
      });
  },


  /**
   * @api {post} /conference/:id
   * @apiVersion 2.3.15
   * @apiName CreateConference
   * @apiGroup Conference
   *
   */
  create_conference: function(req, res) {
    var conf = {
      id: req.param('id'),
      media_server: req.param('media_server')
    };

    function publish_create() {
      confsVideoPresented[conf.id] = false;
      sails.sockets.broadcast(Conference.getRoomName(conf.id), 'conference', {
        verb: 'conference-created',
        conference_id: conf.id,
        videoPresented: false
      });
    };

    function create_channel() {
      return Chat.findOne({
        id: Chat.pidToIdSync(conf.id)
      }).then(function(chat) {
        if (!chat) return;
        var new_channel = {
          chat: chat.id,
          UUID: "room" + req.param('id'),
          team: chat.team,
          name: chat.name
        }

        return Channel.create(new_channel);
      });
    }

    Conference
      .create(conf)
      .then(publish_create)
      .then(res.created)
      // .then(create_channel)
      .catch(res.serverError);
  },

  /**
   * @api {delete} /conference/:id
   * @apiVersion 2.3.15
   * @apiName DeleteConference
   * @apiGroup Conference
   *
   */
  delete_conference: function(req, res) {
    function publish_destroy() {
      sails.sockets.broadcast(Conference.getRoomName(req.param('id')), 'conference', {
        verb: 'conference-destroyed',
        conference_id: req.param('id')
      });
    };
    return Conference.destroy(req.param('id')).then(publish_destroy).then(res.ok).catch(res.serverError);
  }
}