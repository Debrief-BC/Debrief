'use strict';

/**
 * ContactsController
 *
 * @description :: Server-side logic for managing Contacts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * @api {get} /contact
   * @apiVersion 2.3.15
   * @apiName GetContacts
   * @apiGroup Contact
   *
   * @apiDescription This gets all the current user's contacts
   *
   * @apiSuccess {Contact[]} body the array of contacts
   *
   * @apiUse contact
   */

  find: function(req, res) {

    var transformRequest = TransformerService.contact.get(req);

    var filterContacts = function() {
      var findObj = {
        find: {
          owner: req.user
        }
      };
      return Contact.filter.find(req, findObj)
    };

    var transformResponse = function(contacts) {
      return TransformerService.contact.send(contacts);
    };

    transformRequest
      .then(filterContacts)
      .then(transformResponse)
      .then(res.okOrNoContent)
      .catch(res.generalError);
  },

  /**
   * @api {get} /integration/:integration/contacts
   * @apiVersion 2.3.15
   * @apiName GetRemoteContacts
   * @apiGroup Contact
   *
   * @apiDescription This gets a list of contacts from an integration
   *
   * @apiParam {integer} integration the integration id
   *
   * @apiSuccess {Contact} body the contact object
   *
   * @apiUse contact
   */
  findRemoteContacts: function(req, res) {
    var findIntegration = function() {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    var findContacts = function(integeration) {
      return Contact.listContacts(integeration, req.param('skip'), req.param('limit'), req.param('search'));
    }

    TransformerService.contact.get(req)
      .then(findIntegration)
      .then(findContacts)
      .then(TransformerService.contact.send)
      .then(res.okOrNoContent)
      .catch(res.generalError);
  },

  /**
   * @api {get} /contact/:id
   * @apiVersion 2.3.15
   * @apiName GetContact
   * @apiGroup Contact
   *
   * @apiDescription This gets a specific contact
   *
   * @apiParam {integer} id the contact id
   *
   * @apiSuccess {Contact} body the contact object
   *
   * @apiUse contact
   */

  findOne: function(req, res) {
    var transformRequest = TransformerService.contact.get(req);
    var filterContact = function() {
      return Contact.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      });

    };

    var transformResponse = function(contact) {
      return TransformerService.contact.send(contact);
    };

    transformRequest
      .then(filterContact)
      .then(transformResponse)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /integration/:integration/contacts/:id
   * @apiVersion 2.3.15
   * @apiName GetRemoteContact
   * @apiGroup Contact
   *
   * @apiDescription This gets a contact from an integration
   *
   * @apiParam {integer} integration the integration id
   * @apiParam {string} id the contacts id
   *
   * @apiSuccess {Contact} body the contact object
   *
   * @apiUse contact
   */
  findRemoteContact: function(req, res) {
    var findIntegration = function() {
      return Integration.findOne({
        owner: req.user,
        id: req.param('integration')
      });
    }

    var findContacts = function(integeration) {
      return Contact.getContact(integeration, req.param('remoteid'));
    }

    TransformerService.contact.get(req)
      .then(findIntegration)
      .then(findContacts)
      .then(TransformerService.contact.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /contact
   * @apiVersion 2.3.15
   * @apiName CreateContact
   * @apiGroup Contact
   *
   * @apiDescription This creates a new contact
   *
   * @apiParam {Contact} body the contact object
   *
   * @apiUse contact
   */

  create: function(req, res) {

    var validate = ValidatorService.contact.validateCreate(req.body);

    if (req.user) {
      req.body.owner = req.user;
    }

    var transformRequest = function() {
      return TransformerService.contact.get(req);
    };

    var createContact = function() {
      return Contact.createAndPublish(req.body, req)
    };

    validate
      .then(transformRequest)
      .then(createContact)
      .then(TransformerService.contact.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /contact
   * @apiVersion 2.3.15
   * @apiName EditContact
   * @apiGroup Contact
   *
   * @apiDescription This edits a contact
   *
   * @apiParam {integer} id the contact id
   * @apiParam (body) {Contact} body the contact object
   *
   * @apiUse contact
   */

  update: function(req, res) {
    var validate = ValidatorService.contact.validateUpdate(req.body);
    var transformRequest = function() {
      return TransformerService.contact.get(req);
    };

    var updateContact = function() {
      return Contact
        .updateAndPublish({
          id: req.param('id')
        }, req.body, req);
    };

    validate
      .then(transformRequest)
      .then(updateContact)
      .then(TransformerService.contact.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /contact
   * @apiVersion 2.3.15
   * @apiName DeleteContact
   * @apiGroup Contact
   *
   * @apiDescription This deletes a contact
   *
   * @apiParam {integer} id the contact id
   */

  destroy: function(req, res) {

    var destroy = function() {
      return Contact.destroyAndPublish({
        id: req.param('id')
      }, req);
    }

    TransformerService.contact.get(req)
      .then(destroy)
      .then(res.ok)
      .catch(res.generalError);
  }
};