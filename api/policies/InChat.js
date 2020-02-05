'use strict';

module.exports = function(req, res, next) {

  if (!req.isFreeswitch) {

    let reqChatId = req.param('id') || req.param('chatid');

    return Chat.pidToId(reqChatId).then(chatid => {
      return Chat
        .findOne({
          id: chatid
        })
        .populate('users')
        .then(chat => {
          let userIds = _.pluck(chat.users, 'user');
          let test = userIds.indexOf(parseInt(req.user));

          if (test == -1) {
            return res.notFound();
          } else {
            return next();
          }
        })
        .catch(err => {
          return res.serverError({
            error: 'Something went wrong!',
            stackTrace: err
          });
        });
    });

  } else {
    return next();
  }

};