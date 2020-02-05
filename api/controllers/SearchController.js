module.exports = {
  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName Search
   * @apiGroup Search
   * @apiDescription Retrieves a search item
   * @apiParam {string} id
   */

  search: function(req, res) {
    var search = function() {
      return TeamUser.findOne({
        user: req.user,
        team: req.param('team')
      }).then(function(user) {
        return Search.globalSearch(req.param('term') + "*", req.param('team'), user.id, req.param('limit') || null, req.param('skip') || null);
      });
    };

    var localSearch = function() {
      return search().then(TransformerService.search.send);
    };

    var findIntegrations = function() {
      return Integration.find({
        'owner': req.user
      });
    }

    var integrationSearch = function(integrations) {
      if (!integrations) return;
      var promises = [];
      integrations.forEach(function(integration) {
        // if the provider supports contacts
        var contactPromise = Contact.listContacts(integration, 0, 5, req.param('term'))
          .then(function(result) {
            if (!result || result.length == 0) return null;
            return TransformerService.integration.send(integration).then(function(integrationTransformed) {
              return {
                integration: integrationTransformed,
                type: 'contacts',
                content: result
              };
            });
          });
        promises.push(contactPromise);

        // if the provider supports events
        // We will retrieve events locally since outlook integration is taking really long
        /*if (integration.provider == 'google'){
            var eventPromise = Event.listEvents(integration, null, null, null, req.param('term'))
             .then(function (result) {
                 if (!result || result.length == 0) return null;
                 return TransformerService.integration.send(integration).then(function (integrationTransformed) {
                    return {
                        integration: integrationTransformed,
                        type: 'events',
                        content: result
                    };
                 });
             });
            promises.push(eventPromise);
        }*/
      });

      return Promise.all(promises).then(function(results) {
        var rtn = {};
        rtn.integration = true;
        rtn.hits = [];
        results.forEach(function(res) {
          if (res) {
            rtn.hits.push(res);
          }
        });
        return rtn;
      });
    }

    var remoteSearch = function() {
      return findIntegrations().then(integrationSearch).then(TransformerService.search.send);
    }

    var searchAll = function() {
      var results = {};
      var localPromise = localSearch().then(function(res) {
        results.local = res;
      });

      var remotePromise = remoteSearch().then(function(res) {
        results.remote = res;
      });

      return Promise.all([localPromise, remotePromise]).then(function() {
        return results;
      });
    }

    TransformerService.search.get(req)
      .then(searchAll)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName SearchUsers
   * @apiGroup Search
   * @apiDescription Retrieves a search user item
   * @apiParam {string} id
   */

  searchUsers: function(req, res) {
    var search = function() {
      return Search.userSearch(req.param('term'), req.param('team'), req.user, req.param('limit') || null, req.param('skip') || null);
    };
    var getUsers = function(ids) {
      return User.find({
        id: ids
      });
    };
    TransformerService.search.get(req)
      .then(search)
      .then(TransformerService.search.getIds)
      .then(getUsers)
      .then(TransformerService.user.send)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName SearchChats
   * @apiGroup Search
   * @apiDescription Retrieves a search chat item
   * @apiParam {string} id
   */
  searchChats: function(req, res) {
    var search = function() {
      return Search.chatSearch(req.param('term'), req.param('team'), req.user, req.param('limit') || null, req.param('skip') || null);
    };
    var getChats = function(ids) {
      return Chat.find({
        id: ids
      }).populate('users');
    };
    TransformerService.search.get(req)
      .then(search)
      .then(TransformerService.search.getIds)
      .then(getChats)
      .then(TransformerService.chat.send)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName SearchMessages
   * @apiGroup Search
   * @apiDescription Retrieves a search chat messages item
   * @apiParam {string} id
   */
  searchMessages: function(req, res) {
    var search = function() {
      return Search.messageSearch(req.param('term'), req.param('team'), req.user, req.param('limit') || null, req.param('skip') || null);
    };
    var getMessages = function(ids) {
      return ChatMessage.find({
        id: ids
      }).populate('chat').populate('from');
    };
    TransformerService.search.get(req)
      .then(search)
      .then(TransformerService.search.getIds)
      .then(getMessages)
      .then(TransformerService.chatmessage.send)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName SearchFiles
   * @apiGroup Search
   * @apiDescription Retrieves a search chat messages item
   * @apiParam {string} id
   */
  searchFiles: function(req, res) {
    var search = function() {
      return Search.fileSearch(req.param('term'), req.param('team'), req.user, req.param('limit') || null, req.param('skip') || null);
    };
    var getFiles = function(ids) {
      return Files.find({
        id: ids
      }).populate('chat').populate('user');
    };
    TransformerService.search.get(req)
      .then(search)
      .then(TransformerService.search.getIds)
      .then(getFiles)
      .then(TransformerService.files.send)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName SearchInChat
   * @apiGroup Search
   * @apiDescription Retrieves a search chat messages item
   * @apiParam {string} id
   */
  searchInChat: function(req, res) {
    var search = function() {
      return Search.inChatSearch(req.param('term'), req.param('chatid'), req.user, req.param('limit') || null, req.param('skip') || null);
    };
    TransformerService.search.get(req)
      .then(search)
      .then(TransformerService.search.send)
      .then(res.ok)
      .catch(res.serverError);
  },

  /**
   * @api {get} /search/:id
   * @apiVersion 2.3.15
   * @apiName SearchMessages
   * @apiGroup Search
   * @apiDescription Retrieves a search chat messages item
   * @apiParam {string} id
   */
  keypadSearch: function(req, res) {
    var term = req.param('term');
    var team = '';
    var user = req.user;
    var include = req.param('include') || ['callroutes', 'users', 'contacts', 'integrations', 'rooms'];

    function getTeam() {
      team = req.param('team');
    }

    var findCallroutes = function() {
      //Is this a valid extension
      if (/^[a-z0-9]{1,6}$/.test(term)) {
        return CallRoute.find({
            team: team
          }, {
            where: {
              'extension': {
                'like': term + '%'
              }
            }
          }).populate(['owner', 'room'])
          .then(TransformerService.callroute.send);
      }
    }

    var findUsers = function() {
      return Search.userSearch(term, team, user, 5, 0)
        .then(TransformerService.search.getIds)
        .then(function(ids) {
          return User.find({
            id: ids
          });
        }).then(TransformerService.user.send);
    }

    var findLocalContacts = function() {
      return Search.contactSearch(term, user, 5, 0)
        .then(TransformerService.search.getIds)
        .then(function(ids) {
          return Contact.find({
            id: ids
          });
        }).then(TransformerService.contact.send);
    }

    var findIntegrations = function() {
      return Integration.find({
        'owner': req.user,
        'provider': 'google'
      });
    }

    var integrationSearch = function(integrations) {
      if (!integrations) return;
      var promises = [];
      integrations.forEach(function(integration) {
        var contactPromise = Contact.listContacts(integration, 0, 5, term)
          .then(TransformerService.contact.send)
          .then(function(result) {
            return TransformerService.integration.send(integration).then(function(integrationTransformed) {
              if (!result || result.length == 0) return null;
              result.forEach(function(item) {
                item.integration = integrationTransformed;
              });
              return result;
            });
          });
        promises.push(contactPromise);
      });

      return Promise.all(promises).then(function(results) {
        var rtn = [];
        results.forEach(function(res) {
          if (res && Array.isArray(res) && res.length > 0) {
            rtn = rtn.concat(res);
          }
        });
        return rtn;
      });
    }

    var findRooms = function() {
      return Search.roomSearch(term, team, user, 5, 0)
        .then(TransformerService.search.getIds)
        .then(function(ids) {
          return Chat.find({
            id: ids
          }).populate('users');
        }).then(TransformerService.chat.send);
    }

    var findAll = function() {
      var results = {};

      var callroutes = include.indexOf('callroutes') > -1 ? findCallroutes() : null;
      var users = include.indexOf('users') > -1 ? findUsers() : null;
      var contacts = include.indexOf('contacts') > -1 ? findLocalContacts() : null;
      var remote = include.indexOf('integrations') > -1 ? findIntegrations().then(integrationSearch) : null;
      var rooms = include.indexOf('rooms') > -1 ? findRooms() : null;

      return Promise.all([callroutes, users, contacts, remote, rooms]).then(function(results) {
        var rtn = [];
        results.forEach(function(res) {
          if (res && Array.isArray(res) && res.length > 0) {
            rtn = rtn.concat(res);
          }
        });
        return rtn;
      });
    }

    TransformerService.search.get(req)
      .then(getTeam)
      .then(findAll)
      .then(res.ok)
      .catch(res.serverError);
  }
};