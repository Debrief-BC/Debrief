'use strict';

var Transformer = require('./Transformer');
var moment = require('moment-timezone');

module.exports = {
  unifyResponse: function(voicemails, tz_setting) {
    var options = tz_setting ? tz_setting : {
      timezone: 'UTC'
    };
    return Transformer.build(voicemails, {
      'id': {
        key: 'id',
        value: Voicemail.idToPid
      },
      'createdAt': {
        key: 'createdAt',
        value: function(v) {
          if (options) {
            return options.timezone.match(/^UTC-\d{2}:\d{2}$/) ? moment(v).utcOffset(options.timezone).format() : moment(v).tz(options.timezone).format();
          } else {
            return v;
          }
        }
      },
      'updatedAt': {
        key: 'updatedAt',
        value: function(v) {
          if (options) {
            return options.timezone.match(/^UTC-\d{2}:\d{2}$/) ? moment(v).utcOffset(options.timezone).format() : moment(v).tz(options.timezone).format();
          } else {
            return v;
          }
        }
      },
      'cid_team': {
        key: 'from_user',
        value: User.idToPid
      },
      'cid_pstn': {
        key: 'from_pstn',
      },
      'file': {
        key: 'file_url',
        value: function(v) {
          return Files.find({
            id: v
          }).then(function(file) {
            return file[0].url;
          });
        }
      },
      'read_flags': {
        key: 'status',
        value: function(v) {
          if (v === null) {
            return 'new';
          } else {
            return v;
          }
        },
      },
      'personal_owner': {
        key: 'personal_owner',
        value: function(v) {
          if (v) {
            return User.idToPid(v);
          } else {
            return null;
          }
        }
      },
      'team': {
        key: 'slug',
        value: function(v) {
          return Team.findOne(v).then(function(team) {
            return team.slug;
          });
        }
      },
      'transcript': {
        key: 'transcript',
      },
    });
  },

  unifyRequest: function(req) {
    return Transformer.buildGet(req, {
      // TODO: voicemail for group/department
      'id': {
        key: 'id',
        value: Voicemail.pidToId
      },
      'userid': {
        key: 'personal_owner',
        value: User.pidToId
      },
      'groupid': {
        key: 'group_owner',
        value: Chat.pidToId
      },
      'teamid': {
        key: 'team',
        value: Team.pidToId
      },
      'chat': {
        key: 'chat',
        value: Chat.pidToId
      },
      'slug': {
        key: 'team',
        value: function(v) {
          return Team.find({
            slug: v
          }).then(function(teams) {
            if (teams && teams.length > 0) {
              return teams[0].id;
            } else {
              throw new Error('invalid team');
            }
          })
        }
      },
      'flags': {
        key: 'read_flags'
      },
      'from': {
        key: req.body && req.body.client_type && req.body.client_type === 'pstn' ? 'cid_pstn' : 'cid_team',
        value: function(v) {
          if (req.body.client_type === 'pstn') {
            return v;
          } else {
            return User.pidToId(v);
          }
        }
      },
      'to': {
        key: 'personal_owner',
        value: function(v) {
          return User.pidToId(v);
        }
      },
      'to_group': {
        key: 'group_owner',
        value: function(v) {
          return Chat.pidToId(v);
        }
      }
    });
  },

  notificationResponse: function(voicemails, tz_setting) {
    var options = tz_setting ? tz_setting : {
      timezone: 'UTC'
    };
    return Transformer.build(voicemails, {
      'id': {
        key: 'id',
        value: Voicemail.idToPid
      },
      'createdAt': {
        key: 'createdAt',
        value: function(v) {
          if (options) {
            return options.timezone.match(/^UTC-\d{2}:\d{2}$/) ? moment(v).utcOffset(options.timezone).format() : moment(v).tz(options.timezone).format();
          } else {
            return v;
          }
        }
      },
      'updatedAt': {
        key: 'updatedAt',
        value: function(v) {
          if (options) {
            return options.timezone.match(/^UTC-\d{2}:\d{2}$/) ? moment(v).utcOffset(options.timezone).format() : moment(v).tz(options.timezone).format();
          } else {
            return v;
          }
        }
      },
      'cid_team': {
        key: 'from_user',
        value: function(v, srcObj, retObj) {
          if (retObj.team && v) {
            return TeamUser.findOne({
              team: retObj.team,
              user: v.id
            }).then(function(teamuser) {
              return TransformerService.teamuser.send(teamuser);
            })
          } else {
            return v;
          }
        }
      },
      'cid_pstn': {
        key: 'from_pstn',
      },
      'file': {
        key: 'file_url',
        value: function(v) {
          return Files.find({
            id: v
          }).then(function(file) {
            return file[0].url;
          });
        }
      },
      'read_flags': {
        key: 'status',
        value: function(v) {
          if (v === null) {
            return 'new';
          } else {
            return v;
          }
        },
      },
      'personal_owner': {
        key: 'personal_owner',
        value: function(v) {
          if (v) {
            return User.idToPid(v);
          } else {
            return null;
          }
        }
      },
      'team': {
        key: 'slug',
        value: function(v) {
          return Team.findOne(v).then(function(team) {
            return team.slug;
          });
        }
      },
      'transcript': {
        key: 'transcript',
      },
    });
  },
}