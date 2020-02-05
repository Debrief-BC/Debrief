'use strict';

module.exports = function(query, data, model) {
  return new Promise((res, rej) => {
    model.query(query, data, function(err, results) {
      if (err) return rej(err);
      return res(results);
    });
  });
};