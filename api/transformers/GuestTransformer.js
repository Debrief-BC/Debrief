'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id'
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
      'chat': {
        key: 'chat',
        value: function(chat) {
          return Team.findOne({
            slug: req.body.team
          }).then(function(t) {
            return Chat.findOne({
              url: chat,
              team: t.id
            }).then(function(c) {
              return c.id;
            })
          }).catch(function(e) {
            console.log(e);
          });
        }
      },
      'team': {
        key: 'team',
        value: function(team) {
          return Team.findOne({
            slug: team
          }).then(function(t) {
            return t.id;
          }).catch(function(e) {
            console.log(e);
          });
        }
      },
      'blocked': {
        key: 'blocked'
      }
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'id': {
        key: 'user_id',
        value: User.idToPid
      },
      'chat': {
        key: 'chat_id',
        value: Chat.idToPid
      },
      'access_token': {
        key: 'access_token'
      },
      'expires_in': {
        key: 'expires_in'
      },
      'token_type': {
        key: 'token_type'
      },
      'refresh_token': {
        key: 'refresh_token'
      },
      'blocked': {
        key: 'blocked'
      }
    });
  },
  invite: function(req) {
    return Transformer.buildGet(req, {
      'chat': {
        key: 'chat',
        value: function(chat, srjObj, retObj) {
          return Chat.pidToId(chat).then(function(chatId) {
            return Chat.findOne({
              id: chatId
            });
          }).catch(function(e) {
            console.log(e);
          });
        }
      },
      'team': {
        key: 'team',
        value: function(team) {
          return Team.findOne({
            slug: team
          }).then(function(t) {
            return t;
          }).catch(function(e) {
            console.log(e);
          });
        }
      },
      'emails': {
        key: 'emails'
      },
      'pin': {
        key: 'pin'
      }
    });
  },

  getBlock: function(req) {
    return Transformer.buildGet(req, {
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'email': {
        key: 'email'
      },
      'blocked': {
        key: 'blocked'
      },
    });
  },
  sendBlock: function(data) {
    return Transformer.build(data, {
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'email': {
        key: 'email'
      },
      'blocked': {
        key: 'blocked'
      },
      'user': {
        key: 'user',
        value: function(user) {
          return TeamUser.findOne({
            user: user
          }).then(function(teamUser) {
            return TransformerService.teamuser.send(teamUser);
          })
        }
      },
    });
  },
};