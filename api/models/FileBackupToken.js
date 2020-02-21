'use strict';

module.exports = {
  tableName: 'file_backup_token',
  attributes: {
    user: {
      model: 'user',
    },
    token: {
      type: 'string',
    },
  },

  async beforeCreate(values, cb) {
    let token;
    do {
      values.token = UtilsService.uid(40);
      token = await FileBackupToken.findOne({
        token: values.token,
      });
    } while (token);
    cb();
  },
};
