'use strict';

var Transformer = require('./Transformer');

module.exports = {
  get: function(req) {
    return Transformer.buildGet(req, {
      'id': {
        key: 'id',
      },
      'filenames': {
        key: 'filenames',
      },
      'filehashs': {
        key: 'filehashs',
      },
      'filesizes': {
        key: 'filesizes',
      },
      'chats': {
        key: 'chats',
      },
      'file_ids': {
        key: 'fileIds',
      },
    });
  },
  send: function(data) {
    return Transformer.build(data, {
      'user': {
        key: 'user',
      },
      'filename': {
        key: 'name',
      },
      'filehash': {
        key: 'hash',
      },
      'filepath': {
        'key': 'path',
      },
      'filesize': {
        key: 'size',
      },
      'chat': {
        key: 'chat',
      },
      'mobileId': {
        key: 'mobile_id',
      },
      'file': {
        key: 'file',
      },
    });
  },
};
