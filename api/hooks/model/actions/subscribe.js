'use strict';

module.exports = function(req, records, context, model) {
  if (!Array.isArray(records)) {
    records = [records];
  }
  var pks = [];
  if (records.length === 0) {
    return;
  } else if (typeof records[0] === 'object') {
    records.forEach(function(record) {
      pks.push(record[model.primaryKey]);
    }, this);
  } else {
    pks = records;
  }

  return model.baseSubscribe(req, model.idToPidSync(pks), context);
};