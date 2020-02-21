'use strict';

var Transformer = require('./Transformer');

module.exports = {
  send: function(chat) {
    return Transformer.build(chat, {
      'id': {
        key: 'id',
        value: CallRoute.idToPid
      },
      'name': {
        key: 'name'
      },
      'extension': {
        key: 'extension'
      },
      'team': {
        key: 'team',
        value: TransformerService.team.sendTeamOrPid
      },
      'body': {
        key: 'body',
        value: function(body) {
          var promises = [];
          if (typeof body._startingPoint == "string") {
            body._startingPoint = {
              block: body._startingPoint,
              type: "start",
              _pos: {
                x: 10,
                y: 10
              }
            };
          }
          Object.keys(body).forEach(function(key) {
            if (typeof body[key] != "object") {
              return;
            }
            var p = Transformer.build(body[key], {
              'type': {
                key: 'type'
              },
              'user': {
                key: 'user',
                value: TransformerService.user.sendUserOrPid
              },
              'users': {
                key: 'users',
                value: TransformerService.user.sendUserOrPid
              },
              'route': {
                key: 'route',
                value: function(route) {
                  return Transformer.build(body[key].route, {
                    'id': {
                      key: 'id',
                      value: CallRoute.idToPid
                    },
                    'name': {
                      key: 'name'
                    },
                    'extension': {
                      key: 'extension'
                    },
                    'team': {
                      key: 'team',
                      value: TransformerService.team.sendTeamOrPid
                    },
                    'owner': {
                      key: 'owner',
                      value: function(owner) {
                        if (owner) return TransformerService.teamuser.sendUserOrPid(owner);
                      }
                    }
                  });
                }
              },
              'room': {
                key: 'room',
                value: TransformerService.chat.sendChatOrPid
              }
            }).then(function(transformed_body) {
              for (var k in transformed_body) {
                body[key][k] = transformed_body[k];
              }
            });
            promises.push(p);
          });
          return Promise.all(promises).then(function() {
            return body;
          });
        }
      },
      'draft': {
        key: 'draft',
        value: function(body) {
          if (!body) return null;
          var promises = [];
          if (typeof body._startingPoint == "string") {
            body._startingPoint = {
              block: body._startingPoint,
              type: "start",
              _pos: {
                x: 10,
                y: 10
              }
            };
          }
          Object.keys(body).forEach(function(key) {
            if (typeof body[key] != "object") {
              return;
            }
            var p = Transformer.build(body[key], {
              'type': {
                key: 'type'
              },
              'user': {
                key: 'user',
                value: TransformerService.user.sendUserOrPid
              },
              'users': {
                key: 'users',
                value: TransformerService.user.sendUserOrPid
              },
              'route': {
                key: 'route',
                value: function(route) {
                  return Transformer.build(body[key].route, {
                    'id': {
                      key: 'id',
                      value: CallRoute.idToPid
                    },
                    'name': {
                      key: 'name'
                    },
                    'extension': {
                      key: 'extension'
                    },
                    'team': {
                      key: 'team',
                      value: TransformerService.team.sendTeamOrPid
                    },
                    'owner': {
                      key: 'owner',
                      value: function(owner) {
                        if (owner) return TransformerService.teamuser.sendUserOrPid(owner);
                      }
                    }
                  });
                }
              },
              'room': {
                key: 'room',
                value: TransformerService.chat.sendChatOrPid
              }
            }).then(function(transformed_body) {
              for (var k in transformed_body) {
                body[key][k] = transformed_body[k];
              }
            });
            promises.push(p);
          });
          return Promise.all(promises).then(function() {
            return body;
          });
        }
      },
      'owner': {
        key: 'owner',
        value: function(owner) {
          if (owner) return TransformerService.teamuser.sendUserOrPid(owner);
        }
      },
      'room': {
        key: 'room',
        value: function(room) {
          if (room) return TransformerService.chat.sendChatOrPid(room);
        }
      },
      'didnumber': {
        key: 'didnumber',
        value: function(didnumber) {
          if (didnumber) return TransformerService.didnumber.send(didnumber);
        }
      },
    });
  },

  sendCallRouteOrPid: function(data) {
    if ((Array.isArray(data) && typeof data[0] === 'object') || typeof data === 'object') {
      return TransformerService.callroute.send(data);
    } else {
      return CallRoute.idToPid(data);
    }
  },

  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
        value: CallRoute.pidToId
      },
      'name': {
        key: 'name'
      },
      'extension': {
        key: 'extension'
      },
      'team': {
        key: 'team',
        value: Team.pidToId
      },
      'body': {
        key: 'body',
        value: function(body) {
          var promises = [];
          Object.keys(body).forEach(function(key) {
            if (typeof body[key] != "object") {
              return;
            }
            var p = Transformer.build(body[key], {
              'type': {
                key: 'type'
              },
              'user': {
                key: 'user',
                value: User.pidToId
              },
              'users': {
                key: 'users',
                value: User.pidToId
              },
              'route': {
                key: 'route',
                value: CallRoute.pidToId
              },
              'room': {
                key: 'room',
                value: Chat.pidToId
              }
            }).then(function(transformed_body) {
              for (var k in transformed_body) {
                body[key][k] = transformed_body[k];
              }
            });
            promises.push(p);
          });
          return Promise.all(promises).then(function() {
            return body;
          });
        }
      },
      'draft': {
        key: 'draft',
        value: function(body) {
          if (!body) return;
          var promises = [];
          Object.keys(body).forEach(function(key) {
            if (typeof body[key] != "object") {
              return;
            }
            var p = Transformer.build(body[key], {
              'type': {
                key: 'type'
              },
              'user': {
                key: 'user',
                value: User.pidToId
              },
              'users': {
                key: 'users',
                value: User.pidToId
              },
              'route': {
                key: 'route',
                value: CallRoute.pidToId
              },
              'room': {
                key: 'room',
                value: Chat.pidToId
              }
            }).then(function(transformed_body) {
              for (var k in transformed_body) {
                body[key][k] = transformed_body[k];
              }
            });
            promises.push(p);
          });
          return Promise.all(promises).then(function() {
            return body;
          });
        }
      },
      'owner': {
        key: 'owner',
        value: User.pidToId
      },
      'room': {
        key: 'room',
        value: Chat.pidToId
      },
      'slug': {
        key: 'slug'
      },
      'populate_body': {
        key: 'populate_body'
      },
      'populate_didnumber': {
        key: 'populate_didnumber'
      }
    });
  },
};