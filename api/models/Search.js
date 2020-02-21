'use strict';

module.exports = {
  connection: 'elastic',
  elasticSearch: {
    mappings: {
      user: {
        properties: {
          email: {
            type: 'text'
          },
          firstname: {
            type: 'text'
          },
          lastname: {
            type: 'text'
          },
          team: {
            type: 'text'
          },
          avatar: {
            type: 'text'
          },
        }
      },
      contact: {
        properties: {
          firstname: {
            type: 'text'
          },
          lastname: {
            type: 'text'
          },
          company: {
            type: 'text'
          },
          email: {
            type: 'text'
          },
          workNumber: {
            type: 'text',
          },
          homeNumber: {
            type: 'text'
          },
          cellNumber: {
            type: 'text'
          },
          notes: {
            type: 'text'
          },
          website: {
            type: 'text'
          },
          owner: {
            type: 'text'
          }
        }
      },
      chat: {
        properties: {
          name: {
            type: 'text'
          },
          users: {
            type: 'text'
          },
          team: {
            type: 'text'
          },
          type: {
            type: 'text'
          }
        }
      },
      chat_message_chat: {
        _parent: {
          type: 'chat'
        },
        properties: {
          from: {
            type: 'text'
          },
          body: {
            type: 'object'
          },
          team: {
            type: 'text'
          },
          type: {
            type: 'text'
          }
        }
      },
      files: {
        _parent: {
          type: 'chat'
        },
        properties: {
          name: {
            type: 'text'
          },
          extension: {
            type: 'text'
          },
          team: {
            type: 'text'
          },
          user: {
            type: 'text'
          }
        }
      },
      links: {
        _parent: {
          type: 'chat'
        },
        properties: {
          name: {
            type: 'text'
          },
          user: {
            type: 'text'
          },
          link: {
            type: 'text'
          }
        }
      },
      event: {
        _parent: {
          type: 'chat'
        },
        properties: {
          name: {
            type: 'text'
          },
          user: {
            type: 'text'
          },
          organizer: {
            type: 'text'
          },
          start: {
            type: 'text'
          },
          end: {
            type: 'text'
          },
          team: {
            type: 'text'
          }
        }
      }
    }
  },
  create: function(values, id, type, parent) {
    var obj = {
      index: this.identity,
      type: type,
      id: id,
      body: values
    };

    if (parent) {
      obj.parent = parent;
    }
    return this.client().create(obj).catch((err) => {
      console.error('error', err);
    });
  },
  update: function(values, id, type, parent) {
    var obj = {
      index: this.identity,
      type: type,
      id: id,
      body: {
        doc: values
      }
    };

    if (parent) {
      obj.parent = parent;
    }
    return this.client().update(obj).catch((err) => {
      console.error('error', err);
    });
  },
  destroy: function(id, type, parent) {
    var obj = {
      index: this.identity,
      type: type,
      id: id
    };

    if (parent) {
      obj.parent = parent;
    }
    return this.client().delete(obj).catch((err) => {
      console.error('error', err);
    });
  },
  globalSearch: function(searchterm, team, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    searchterm = searchterm.toLowerCase();
    var query = {
      "bool": {
        "must": [{
          "bool": {
            "should": [{
              "term": {
                "team": team
              }
            }, {
              "bool": {
                "must": [{
                  "term": {
                    "owner": user
                  }
                }, {
                  "term": {
                    "_type": "contact"
                  }
                }]
              }
            }]
          }
        }, {
          "query_string": {
            "query": searchterm,
            "lowercase_expanded_terms": false
          }
        }],
        "filter": {
          "bool": {
            "should": [{
              "bool": {
                "must": [{
                  "term": {
                    "_type": "chat_message_chat"
                  }
                }, {
                  "has_parent": {
                    "type": "chat",
                    "query": {
                      "match": {
                        "users": user
                      }
                    }
                  }
                }]
              }
            }, {
              "bool": {
                "must": [{
                  "term": {
                    "_type": "files"
                  }
                }, {
                  "has_parent": {
                    "type": "chat",
                    "query": {
                      "match": {
                        "users": user
                      }
                    }
                  }
                }]
              }
            }, {
              "bool": {
                "must": [{
                  "term": {
                    "_type": "event"
                  }
                }, {
                  "has_parent": {
                    "type": "chat",
                    "query": {
                      "match": {
                        "users": user
                      }
                    }
                  }
                }]
              }
            }, {
              "bool": {
                "must": [{
                  "term": {
                    "_type": "chat"
                  }
                }, {
                  "match": {
                    "users": user
                  }
                }]
              }
            }, {
              "term": {
                "_type": "user"
              }
            }, {
              "term": {
                "_type": "contact"
              }
            }]
          }
        }
      }
    };
    return this.client().search({
        index: this.identity,
        body: {
          query: query
        },
        from: skip,
        size: limit
      })
      .then(function(result) {
        return result;
      });
  },
  userSearch: function(searchterm, team, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    searchterm = searchterm.toLowerCase();
    var query = {
      "bool": {
        "must": [{
          "term": {
            "team": team
          }
        }, {
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "term": {
            "_type": "user"
          }
        }, ]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  contactSearch: function(searchterm, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    var query = {
      "bool": {
        "must": [{
          "term": {
            "owner": user
          }
        }, {
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "term": {
            "_type": "contact"
          }
        }, ]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  chatSearch: function(searchterm, team, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    var query = {
      "bool": {
        "must": [{
          "term": {
            "team": team
          }
        }, {
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "term": {
            "_type": "chat"
          }
        }, {
          "match": {
            "users": user
          }
        }, ]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  roomSearch: function(searchterm, team, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    var query = {
      "bool": {
        "must": [{
          "term": {
            "team": team
          }
        }, {
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "term": {
            "_type": "chat"
          }
        }, {
          "match": {
            "users": user
          }
        }, {
          "match": {
            "type": "room"
          }
        }]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  messageSearch: function(searchterm, team, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    var query = {
      "bool": {
        "must": [{
          "term": {
            "team": team
          }
        }, {
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "term": {
            "_type": "chat_message_chat"
          }
        }, {
          "has_parent": {
            "type": "chat",
            "query": {
              "match": {
                "users": user
              }
            }
          }
        }]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  fileSearch: function(searchterm, team, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    var query = {
      "bool": {
        "must": [{
          "term": {
            "team": team
          }
        }, {
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "term": {
            "_type": "files"
          }
        }, {
          "has_parent": {
            "type": "chat",
            "query": {
              "match": {
                "users": user
              }
            }
          }
        }]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  inChatSearch: function(searchterm, chat, user, limit, skip) {
    limit = limit || 20;
    skip = skip || 0;
    var query = {
      "bool": {
        "must": [{
          "wildcard": {
            "_all": searchterm + "*"
          }
        }, {
          "has_parent": {
            "type": "chat",
            "query": {
              "term": {
                "_id": chat
              }
            }
          }
        }]
      }
    };
    return this.client().search({
      index: this.identity,
      body: {
        query: query
      },
      from: skip,
      size: limit
    });
  },
  deleteSearchDB: function() {
    return this.client().indices.delete({
      index: '*'
    });

  },
  rebuildSearchDB: function() {
    const LIMIT = 100;

    // Team User
    var tu = TeamUser.count({}).then(function(count) {
      var counter = 0;
      var promises = [];

      while (counter < count) {

        promises.push(TeamUser.find({
          skip: counter,
          limit: LIMIT
        }).then(function(users) {
          var body = [];

          users.forEach(function(user) {
            // action description
            body.push({
              index: {
                _index: Search.identity,
                _type: "user",
                _id: user.id
              }
            });
            // the document to index
            body.push({
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              team: user.team
            });
          });

          Search.client().bulk({
            body: body
          });
        }));

        counter += LIMIT;
      };

      return Promise.all(promises);
    });

    // Contact
    var co = Contact.count({}).then(function(count) {
      var counter = 0;
      var promises = [];

      while (counter < count) {

        promises.push(Contact.find({
          skip: counter,
          limit: LIMIT
        }).then(function(contacts) {
          var body = [];

          contacts.forEach(function(contact) {
            // action description
            body.push({
              index: {
                _index: Search.identity,
                _type: "contact",
                _id: contact.id
              }
            });
            // the document to index
            body.push(contact);
          });

          Search.client().bulk({
            body: body
          });
        }));

        counter += LIMIT;
      };

      return Promise.all(promises);
    });

    // Chat
    var ch = Chat.count({}).then(function(count) {
      var counter = 0;
      var promises = [];

      while (counter < count) {

        promises.push(Chat.find({
          skip: counter,
          limit: LIMIT
        }).populate('users').then(function(chats) {
          var body = [];

          chats.forEach(function(chat) {
            // action description
            body.push({
              index: {
                _index: Search.identity,
                _type: "chat",
                _id: chat.id
              }
            });
            // the document to index
            body.push({
              name: chat.name,
              users: _.pluck(chat.users, 'id'),
              team: chat.team,
              type: chat.type
            });
          });

          Search.client().bulk({
            body: body
          });
        }));

        counter += LIMIT;
      };

      return Promise.all(promises);
    }).then(function() {

      return ChatMessage.count({
        type: "text"
      }).then(function(count) {
        var counter = 0;
        var promises = [];

        while (counter < count) {

          promises.push(ChatMessage.find({
            type: "text",
            skip: counter,
            limit: LIMIT
          }).populate('chat').populate('from').then(function(msgs) {
            var body = [];

            msgs.forEach(function(message) {
              if (message.chat) {
                // action description
                body.push({
                  index: {
                    _index: Search.identity,
                    _type: "chat_message_chat",
                    _id: message.id,
                    parent: message.chat.id
                  }
                });
                // the document to index
                var bodyobj = {
                  val: {
                    message: message.body
                  }
                };
                body.push({
                  from: message.from ? message.from.id : null,
                  body: bodyobj,
                  team: message.chat.team,
                  type: message.type
                });
              }
            });

            Search.client().bulk({
              body: body
            });
          }));

          counter += LIMIT;
        };

        return Promise.all(promises);
      })
    });

    // File
    var f = Files.count({}).then(function(count) {
      var counter = 0;
      var promises = [];

      while (counter < count) {

        promises.push(Files.find({
          skip: counter,
          limit: LIMIT
        }).then(function(files) {
          var body = [];

          files.forEach(function(file) {
            // action description
            body.push({
              index: {
                _index: Search.identity,
                _type: "files",
                _id: file.id,
                parent: file.chat
              }
            });
            // the document to index
            body.push({
              name: file.filename,
              extension: file.extension,
              team: file.team,
              user: file.user
            });
          });

          Search.client().bulk({
            body: body
          });
        }));

        counter += LIMIT;
      };

      return Promise.all(promises);
    });

    // Link
    var l = Links.count({}).then(function(count) {
      var counter = 0;
      var promises = [];

      while (counter < count) {

        promises.push(Links.find({
          skip: counter,
          limit: LIMIT
        }).then(function(links) {
          var body = [];

          links.forEach(function(link) {
            // action description
            body.push({
              index: {
                _index: Search.identity,
                _type: "links",
                _id: link.id,
                parent: link.chat
              }
            });
            // the document to index
            body.push({
              name: link.title,
              user: link.user,
              link: link.link
            });
          });

          Search.client().bulk({
            body: body
          });
        }));

        counter += LIMIT;
      };

      return Promise.all(promises);
    });

    // Event
    var e = Event.count({}).then(function(count) {
      var counter = 0;
      var promises = [];

      while (counter < count) {

        promises.push(Event.find({
          skip: counter,
          limit: LIMIT
        }).populate("chat").then(function(events) {
          var body = [];

          events.forEach(function(event) {
            // action description
            body.push({
              index: {
                _index: Search.identity,
                _type: "event",
                _id: event.id,
                parent: event.chat.id
              }
            });
            // the document to index
            body.push({
              name: event.name,
              user: event.user,
              organizer: event.organizer,
              start: event.start.toString(),
              end: event.end.toString(),
              team: event.chat.team
            });
          });

          Search.client().bulk({
            body: body
          });
        }));

        counter += LIMIT;
      };

      return Promise.all(promises);
    });

    return Promise.all([tu, co, ch, f, l, e]).then(function(res) {
      console.log('SearchDB ready...');
    }).catch(function(err) {
      console.error('error', err);
    });
  }
};