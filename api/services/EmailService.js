'use strict';

/**
 * Email Service
 *
 * A Service that talks to an external email provider to send off emails.
 */
const Mandrill = require('mandrill-api/mandrill');
const MandrillClient = new Mandrill.Mandrill();

module.exports = {
  send(options) {
    MandrillClient.messages.send(options);
  },
  sendEmail(template, user, options, password) {
    sails.hooks.email.send(
      template, {
        link: sails.config.templateData.feServer,
        team: options.team.name,
        name: user.firstname,
        invitee: options.invite ? options.invite.firstname + 'on' : '',
        password: password,
        login: user.email
      }, {
        to: user.email,
        subject: options.subject
      },
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
};