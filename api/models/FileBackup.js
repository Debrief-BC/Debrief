'use strict';

module.exports = {
  attributes: {
    filename: {
      type: 'string',
    },
    filehash: {
      type: 'string',
    },
    filepath: {
      type: 'string',
    },
    filesize: {
      type: 'integer',
      size: 64,
    },
    user: {
      model: 'user',
    },
    chat: {
      model: 'chat',
    },
    mobileId: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    file: {
      model: 'files',
    },
  },
};
