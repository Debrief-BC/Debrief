'use strict';

var emojione = require('emojione');

module.exports = {
  /**
   * @api {get} /integration/:integration/event
   * @apiVersion 2.3.15
   * @apiName GetEvents
   * @apiGroup Events
   * @apiDescription returns a list of events
   */

  find(req, res) {
    const transformRequest = TransformerService.event.get(req);

    const findIntegration = () => {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    const filterEvents = (integration) => {
      return Event.listEvents(integration, req.param('start'), req.param('end'), req.param('chat'), req.param('search'));
    };

    transformRequest
      .then(findIntegration)
      .then(filterEvents)
      .then(TransformerService.event.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {get} /integration/:integration/event/:id
   * @apiVersion 2.3.15
   * @apiName GetEvents
   * @apiGroup Events
   * @apiDescription returns the details of an individual event
   * @apiParam {string} id
   */

  findOne(req, res) {
    const transformRequest = TransformerService.event.get(req);

    const findIntegration = () => {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    var checkUser = function(integration) {
      if (integration.owner != req.user) throw {
        errorType: 'forbidden'
      };
      return integration;
    }

    var findEvent = function(integration) {
      return Event.getEvent(integration, req.param('id'));
    };

    transformRequest
      .then(findIntegration)
      .then(checkUser)
      .then(findEvent)
      .then(TransformerService.event.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {post} /integration/:integration/event
   * @apiVersion 2.3.15
   * @apiName AddEvent
   * @apiGroup Events
   * @apiDescription Adds an event
   * @apiParam {string} id
   */

  create(req, res) {
    const validate = ValidatorService.event.validateCreate(req.body);
    const transformRequest = () => {
      return TransformerService.event.get(req);
    };

    const findIntegration = () => {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    const checkOverride = (integration) => {
      let list = [];
      if (req.body.override) {
        req.body.override.forEach((email) => {
          list.push({
            email: email
          })
        })
        req.body.override = list;
      }
      return integration;
    }

    const createEventOnProvider = (integration) => {
      return Event.createOnProvider(integration, req.body);
    };

    validate
      .then(transformRequest)
      .then(findIntegration)
      .then(checkOverride)
      .then(createEventOnProvider)
      .then(TransformerService.event.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /integration/:integration/event/:id
   * @apiVersion 2.3.15
   * @apiName EditEvent
   * @apiGroup Events
   * @apiDescription Edits a event
   * @apiParam {string} id
   */

  update(req, res) {
    const validate = ValidatorService.event.validateUpdate(req.body);
    const transformRequest = () => {
      return TransformerService.event.get(req);
    };
    let integration = null;

    const findIntegration = () => {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    const updateEventOnProvider = (result) => {
      integration = result;
      return Event.updateOnProvider(integration, req.param('id'), req.body);
    };

    const findUpdatedEvent = () => {
      return Event.getEvent(integration, req.param('id'));
    };

    validate
      .then(transformRequest)
      .then(findIntegration)
      .then(updateEventOnProvider)
      .then(findUpdatedEvent)
      .then(TransformerService.event.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /integration/:integration/event/:id
   * @apiVersion 2.3.15
   * @apiName DeleteEvent
   * @apiGroup Events
   * @apiDescription Deletes an event
   * @apiParam {string} id
   */

  destroy(req, res) {
    const transformRequest = TransformerService.event.get(req);
    const integration = null;

    const findIntegration = function() {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    const findCalendarEvent = (result) => {
      integration = result;
      return Event.getEvent(integration, req.param('id')).then((event) => {
        if (event.chat) {
          if (event.name.includes("Invitation:")) {
            let re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
            event.name = event.name.replace(re, "$2");
          }
          return findLocalEvent(event)
        } else {
          return integration;
        }
      }).catch(err => {
        throw new Error(err);
      });
    }

    const findLocalEvent = (calEvent) => {
      return Team.pidToId(calEvent.chat.team).then((team) => {
        return TeamUser.findOne({
          user: integration.owner,
          team: team
        }).then((user) => {
          let eventDate = new Date(calEvent.start)
          return Event.findOne({
            user: user.id,
            name: emojione.toShort(calEvent.name),
            start: eventDate
          }).then((event) => {
            if (event.organizer === user.id) {
              return removeAllEvents(event);
            } else {
              return Event.destroy({
                id: event.id
              }).then((result) => {
                return integration;
              }).catch(err => {
                throw new Error(err);
              });
            }
          })
        })
      })
    }

    var removeAllEvents = function(event) {
      return Event.find({
        name: event.name,
        start: event.start,
        organizer: event.organizer
      }).then(function(events) {
        var ids = _.pluck(events, 'id');
        return Event.destroy({
          id: ids
        }).then(function(result) {
          return integration;
        })
      })
    }

    var deleteEvent = function() {
      return Event.destroyEvent(integration, req.param('id'));
    }

    transformRequest
      .then(findIntegration)
      .then(findCalendarEvent)
      .then(deleteEvent)
      .then(res.ok)
      .catch(res.generalError)
  },

  /**
   * @api {delete} /integration/:integration/event/:id/user/:email
   * @apiVersion 2.3.15
   * @apiName DeleteEvent
   * @apiGroup Events
   * @apiDescription Deletes an event
   * @apiParam {string} id
   */

  removeGuests: function(req, res) {
    var transformRequest = TransformerService.event.get(req);

    var findIntegration = function() {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    var checkUser = function(integration) {
      if (integration.owner != req.user) throw {
        errorType: 'forbidden'
      };
      return integration;
    }

    var findEvent = function(integration) {
      return Event.getEvent(integration, req.param('id'));
    };

    var removeUser = function(event) {
      return Chat.pidToId(event.chat.id).then(function(chatId) {
        return Event.findOne({
          name: event.name,
          chat: chatId,
          start: event.start
        }).then(function(localEvent) {
          return Event.removeAttendeesEvent(localEvent.id, req.param('email'));
        })
      })
    };

    transformRequest
      .then(findIntegration)
      .then(checkUser)
      .then(findEvent)
      .then(removeUser)
      .then(TransformerService.event.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
  /**
   * @api {post} /integration/:integration/event/:id/user
   * @apiVersion 2.3.15
   * @apiName addGuests
   * @apiGroup Events
   * @apiDescription Deletes an event
   * @apiParam {string} id
   */

  addGuests: function(req, res) {
    var transformRequest = TransformerService.event.getAddGuests(req);
    var integration = null;

    var findIntegration = function() {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    var findEvent = function(result) {
      integration = result;
      return Event.getEvent(integration, req.param('id'));
    };

    var addUser = function(event) {
      return Chat.pidToId(event.chat.id).then(function(chatId) {
        if (event.name.includes("Invitation:")) {
          var re = /(.*Invitation:\s+)(.*)(\s+@.*)/;
          event.name = event.name.replace(re, "$2");
        }
        var eventDate = new Date(event.start)
        return Event.findOne({
          name: event.name,
          chat: chatId,
          start: eventDate
        }).then(function(localEvent) {
          return Event.addAttendeesEvent(localEvent.id, req.body.emails);
        })
      })
    };

    var findUpdatedEvent = function() {
      return Event.getEvent(integration, req.param('id'));
    };

    transformRequest
      .then(findIntegration)
      .then(findEvent)
      .then(addUser)
      .then(findUpdatedEvent)
      .then(TransformerService.event.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  }
}