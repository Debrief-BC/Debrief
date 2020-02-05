'use strict';

var Faker = require('faker');

module.exports = {
  /**
   * @api {get} /guest/:id
   * @apiVersion 2.3.15
   * @apiName InviteGuest
   * @apiGroup Guest
   * @apiDescription Invites a Guest
   * @apiParam {string} id
   */

  invite: function(req, res) {
    var validate = ValidatorService.guest.validateInvite(req.body);
    var transformRequest = function() {
      return TransformerService.guest.invite(req);
    };

    var getInvitee = function() {
      return TeamUser.findOne({
        user: req.user,
        team: req.body.chat.team
      }).then(function(user) {
        if (user) {
          return user;
        }
      });
    };

    var sendInvite = function(invitee) {
      return Chat.idToPid(req.body.chat.pin).then(function(chatPid) {
        req.body.pin = chatPid;
        _.each(req.body.emails, function(email) {
          return GuestInvite.sendEmail(req.body, email, invitee);
        });
      })
    };

    validate
      .then(transformRequest)
      .then(getInvitee)
      .then(sendInvite)
      .then(TransformerService.guest.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {get} /guest/:id
   * @apiVersion 2.3.15
   * @apiName InviteGuest
   * @apiGroup Guest
   * @apiDescription Invites a Guest
   * @apiParam {string} id
   */
  join: function(req, res) {

    var pin = req.body.pin;
    var teamUser = {};
    var validate = ValidatorService.guest.validateCreate(req.body);
    var transformRequest = function() {

      return TransformerService.guest.get(req);

    };

    var createGuestUser = function() {

      var guest = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: Faker.internet.email()
      }

      return User.createAndPublish(guest, req);
    };

    var createGuest = function(result) {

      if (req.body.email) {
        var guest = {
          email: req.body.email,
          chat: req.body.chat,
          user: result.id
        }

        return GuestInvite.createAndPublish(guest, req).then(function() {
          return result;
        });
      } else {
        return result;
      }

    };

    var createUserOnAuth = function(result) {
      var user = {
        email: result.email,
        password: Faker.internet.password(),
        id: result.id
      };

      result.chat = req.body.chat;
      result.auth_password = user.password;

      return User.createUserOnAuth(user).then(function(auth_user) {
        result.auth_user = auth_user;
        return result;
      });
    };

    var addGuestToTeam = function(guest) {
      return TeamUser
        .create({
          user: guest.id,
          team: req.param('team'),
          role: 4
        })
        .then(function(teamuser) {
          teamUser = teamuser;
          return guest;
        });
    };

    var addContactToSaleForce = function(guest) {
      return Team.findOne({
        id: req.param('team')
      }).then(function(team) {
        var lastname = "(Guest)";
        if (guest.lastname) {
          lastname = guest.lastname;
        }
        var contact = {
          firstName: guest.firstname,
          lastName: lastname,
          email: req.body.email,
          title: "Guest",
          role__c: "guest"
        };

        return Salesforce.createContact(team.name, contact).then(function(r) {
          return guest;
        });
      }).catch(function(err) {
        console.error(err);
        return guest;
      });
    };
    var createCallRoute = function(result) {

      return CallRoute.createUserRoute(teamUser, teamUser.team, 100)
        .then(function(route) {
          console.log(route);
          return result;
        })
        .catch(function(err) {
          console.error(err);
          return result;
        });
    };

    var addGuestToChat = function(guest) {
      return ChatUser.addAndPublish({
        user: teamUser.id,
        chat: req.body.chat
      }).then(function() {
        return guest;
      });
    };

    var loginUser = function(guest) {

      return User.loginUser(guest.auth_user).then(function(r) {
        guest.access_token = r.access_token;
        guest.refresh_token = r.refresh_token;
        guest.token_type = r.token_type;
        guest.expires_in = r.expires_in;

        return guest;
      });

    };

    var addMessage = function(guest) {
      var body = [guest.id.toString()];
      var msg = {
        type: 'participant_added',
        body: body,
        from: guest.id,
        chat: guest.chat
      };
      ChatMessage.createAndPublish(msg);

      return guest;

    };

    validate
      .then(transformRequest)
      .then(createGuestUser)
      .then(createUserOnAuth)
      .then(createGuest)
      .then(addMessage)
      .then(addGuestToTeam)
      .then(addContactToSaleForce)
      .then(createCallRoute)
      .then(addGuestToChat)
      .then(loginUser)
      .then(TransformerService.guest.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {get} /guest/:id
   * @apiVersion 2.3.15
   * @apiName BlockGuest
   * @apiGroup Guest
   * @apiDescription Invites a Guest
   * @apiParam {string} id
   */

  block: function(req, res) {
    var transformRequest = function() {

      return TransformerService.guest.getBlock(req);

    };
    var getGuest = function() {
      return GuestInvite.findOne({
        email: req.body.email,
        chat: req.body.chat
      }).then(function(guest) {
        var blocked = true;
        if (typeof req.body.blocked !== 'undefined') blocked = req.body.blocked
        if (guest) {
          return GuestInvite.updateAndPublish({
            id: guest.id
          }, {
            blocked: blocked
          });
        } else {
          return GuestInvite.createAndPublish({
            email: req.body.email,
            chat: req.body.chat,
            blocked: blocked
          })
        }
      });
    };

    transformRequest()
      .then(getGuest)
      .then(TransformerService.guest.send)
      .then(res.created)
      .catch(res.generalError);


  }
};