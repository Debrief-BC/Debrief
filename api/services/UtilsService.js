'use strict';

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

class UtilsService {
  static uid(len) {
    let buf = [],
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      charlen = chars.length;

    const u = new UtilsService();

    for (let i = 0; i < len; i++) {
      buf.push(chars[u.getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
  }

  uidLight(len) {
    let buf = [],
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      charlen = chars.length;

    const u = new UtilsService();

    for (let i = 0; i < len; i++) {
      buf.push(chars[this.u.getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
  }

  /**
   * Return a random int, used by `utils.uid()`
   *
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   * @api private
   */

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = UtilsService;
