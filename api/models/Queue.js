'use strict';

module.exports = {
  connection: 'redis',
  attributes: {
    count: {
      type: 'float'
    },
    name: {
      type: 'string'
    }
  },
  /**
   * Add user to a chat set
   */
  addChat(chatId, userId) {
    return new Promise((resolve, reject) => {
      Queue.native((err, conn) => {
        if (err) {
          console.log('err', err);
          reject(err);
        }

        conn.zadd(chatId, 0, userId, (err, result) => {
          if (err) {
            console.log('err zadd', err);
            reject(err);
          }

          resolve(result);
        });
      });
    });
  },
  /**
   * Remove user from a chat set
   */
  remChat(chatId, userId) {
    return new Promise((resolve, reject) => {
      Queue.native((err, conn) => {
        if (err) {
          console.log('err', err);
          reject(err);
        }

        conn.zrem(chatId, userId, (err, result) => {
          if (err) {
            console.log('err zrem', err);
            reject(err);
          }

          resolve(result);
        });
      });
    });
  },

  /**
   * Update a user's message count
   */
  updateCount(chatId, userId, count) {
    return new Promise((resolve, reject) => {
      Queue.native((err, conn) => {
        if (err) {
          console.log('updateCount:model:', err);
          reject(err);
        }

        conn.zincrby(chatId, count, userId, (err, result) => {
          if (err) {
            console.log('zincrby_error', err);
            reject(err);
          }

          resolve(result);
        });
      });
    })
  },
  /**
   * Add user to a chat set
   */
  resetChatCount(chatId, userId) {
    return new Promise((resolve, reject) => {
      Queue.native((err, conn) => {
        if (err) {
          console.log('err', err);
          reject(err);
        }

        conn.zadd(chatId, 0, userId, (err, result) => {
          if (err) {
            console.log('err zadd', err);
            reject(err);
          }

          resolve(result);
        });
      });
    });
  },

  /**
   * Get a user's message count
   */
  getUserCount(chatId, userId) {
    return new Promise((resolve, reject) => {
      Queue.native((err, conn) => {
        if (err) {
          console.log('getUserCount:model:', err);
          reject(err);
        }

        conn.zscore(chatId, userId, (err, result) => {
          if (err) {
            console.log('zscore_error', err);
            reject(err);
          }

          resolve(result);
        });
      });
    });
  }

};