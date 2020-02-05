'use strict';

module.exports = (req, res, next) => {
  if (!req.isSuperAdmin && req.user) {
    let getTeam = () => {
      return TeamUser.findOne({
          id: req.user
        })
        .populate('team')
        .then(teamUser => {
          return teamUser.team
        });
    };

    let checkTeamStatus = (team) => {
      switch (team.activated) {
        case 'pending':
          //Check if its been 14 days since active
          var currentDate = new Date();
          var timeDiff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(team.createdAt.getFullYear(), team.createdAt.getMonth(), team.createdAt.getDate())) / (1000 * 60 * 60 * 24));
          if (timeDiff > 14) {
            //Check if user has a credit card
            return CreditCards.getDefault(team.billingId)
              .then(function(card) {
                return Team.updateAndPublish({
                  id: team.id
                }, {
                  activated: "paywall"
                })
              })
              .catch(function(err) {
                console.log('err', err);
                return team;
              });
          }
          break;
        case 'active':
          if (team.billingId) {
            return CreditCards.getDefault(team.billingId)
              .then(function(card) {
                if (!card) {
                  return Team.updateAndPublish({
                    id: team.id
                  }, {
                    activated: "paywall"
                  })
                }
              })
              .catch(function(err) {
                console.log('err', err);
                return team;
              });
          }
          break;
        default:
          break;
      }
    };

    return getTeam().then(checkTeamStatus).then(next);
  } else {
    return next();
  }
}