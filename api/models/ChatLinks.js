'use strict';

module.exports = {
  attributes: {
    chat: {
      model: 'chat'
    },
    owner: {
      model: 'user'
    },
    links: {
      model: 'links'
    }
  },
  publishCreateOverride: function(item, req) {
    return Links.find({
      id: item.links
    }).then(function(links) {
      return Chat.findOne({
        id: item.chat
      }).then(function(results) {
        results.links = links;
        return Chat.publishAdd(item.chat, 'messages', results, req);
      });
    });
  }
}