'use strict';

/**
 * FileBackupController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @api {get} /backup-url
   * @apiVersion 2.3.15
   * @apiName GetBackupURL
   * @apiGroup FileBackup
   * @apiDescription Get Upload URL
   */

  async getURL(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.user,
        },
        select: ['storageUsed', 'totalStorage'],
      });

      const backupToken = await FileBackupToken.create({
        user: req.user,
      });

      return res.ok({
        url: `${sails.config.ipfs.proxy}/${backupToken.token}`,
        availableStorage: user.totalStorage - user.storageUsed,
      });
    } catch (err) {
      console.log('Backup error: ', err);
      return res.serverError(err);
    }
  },

  async checkFileToken(req, res) {
    try {
      const tokenId = req.param('token');

      const token = await FileBackupToken.findOne({
        token: tokenId,
      });

      if (!!token) {
        await FileBackupToken.destroy({
          token: tokenId,
        });
      }

      return res.ok({
        exists: !!token,
      });
    } catch (err) {
      console.log('check error', err);
      return res.serverError(err);
    }
  },

  async updateUsage(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.user,
        },
        select: ['id', 'username', 'storageUsed', 'totalStorage', 'lastBackup'],
      });

      const userFiles = await FileBackup.find({
        user: req.user,
      });

      const knownFileHashes = [];
      let storageUsed = 0;

      for (const file of userFiles) {
        knownFileHashes.push(file.filehash);

        if (!isNaN(file.filesize)) {
          storageUsed += file.filesize;
        }
      }

      for (const file of req.body.files) {
        if (knownFileHashes.indexOf(file.hash) < 0) {
          const i = req.body.files.indexOf(file);

          await FileBackup.create({
            filename: file.name,
            filehash: file.hash,
            filepath: file.path,
            filesize: parseInt(file.size),
            user: user.id,
            chat:
              Array.isArray(req.body.chats) && req.body.chats.length > i ? req.body.chats[i] : null,
            file:
              Array.isArray(req.body.fileIds) && req.body.fileIds.length > i
                ? req.body.fileIds[i]
                : null,
          });

          storageUsed += parseInt(file.size);
        }
      }

      const updatedUser = await User.update(
        {
          id: user.id,
        },
        {
          storageUsed,
        }
      );

      return res.ok(updatedUser);
    } catch (err) {
      console.log('Update error: ', err);
      return res.serverError(err);
    }
  },

  /**
   * @api {post} /backup
   * @apiVersion 2.3.15
   * @apiName Backup
   * @apiGroup FileBackup
   *
   * @apiDescription Backup files
   *
   * @apiParam {string[]} filenames Uploaded files name
   * @apiParam {string[]} filehashs Uploaded files hash
   * @apiParam {string[]} filesizes Uploaded files size
   * @apiParam {string[]} chats Chat
   * @apiParam {string[]} id Device Id
   *
   * @apiSuccess {Object}
   *
   */

  async backup(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.user,
        },
        select: ['id', 'username', 'storageUsed', 'totalStorage', 'lastBackup'],
      });
      await ValidatorService.filebackup.validateBackup(req, user);

      let files = [];
      let storageUsed = user.storageUsed;
      for (let i in req.body.filenames) {
        files.push(
          await FileBackup.create({
            filename: req.body.filenames[i],
            filehash: req.body.filehashs[i],
            filesize: parseInt(req.body.filesizes[i]),
            user: user.id,
            chat: req.body.chats[i],
            mobileId: req.body.id,
          })
        );
        storageUsed += req.body.filesizes[i];
      }

      await User.update(
        {
          id: user.id,
        },
        {
          storageUsed,
        }
      );

      const transformResponse = await TransformerService.filebackup.send(files);
      return res.ok(transformResponse);
    } catch (err) {
      console.log('Backup error: ', err);
      return res.serverError(err);
    }
  },

  /**
   * @api {post} /restore
   * @apiVersion 2.3.15
   * @apiName FileBackupRestore
   * @apiGroup FileBackup
   *
   * @apiDescription List of files in IPFS for user, used for restoring.
   *
   * @apiParam {String} files Files to be restored.
   * @apiSuccess {Object}
   *
   */
  async restore(req, res) {
    try {
      const files = await FileBackup.find({
        where: {
          user: req.user,
        },
        select: ['user', 'path', 'filepath', 'filename', 'filesize', 'chat', 'file', 'mobileId'],
      });
      const transformResponse = await TransformerService.filebackup.send(files);
      return res.ok(transformResponse);
    } catch (err) {
      console.log('Restore error: ', err);
      return res.serverError(err);
    }
  },
};
