'use strict';

module.exports = {
  tableName: 'team_user_invite',
  attributes: {
    invitedBy: {
      model: 'teamuser'
    },
    team: {
      model: 'team'
    },
    email: {
      type: 'string',
      required: true
    }
  },
  sendEmail: function(template, invite, team, existingUser) {
    sails.hooks.email.send(
      template, {
        link: sails.config.templateData.feServer + '/join/' + invite.pid,
        invitee: existingUser.firstname,
        team: team.name
      }, {
        to: invite.email,
        subject: "You have been invited to " + team.name + " on Debrief!"
      },
      function(err) {
        if (err) console.log(err);
      }
    );
  }
};