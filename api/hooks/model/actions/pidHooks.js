'use strict';

module.exports = {
  pidToId: function(pids, model) {
    return new Promise(function(resolve, reject) {
      try {
        var ids = null;
        if (Array.isArray(pids)) {
          ids = [];
          pids.forEach(function(pid) {
            if (pid)
              ids.push(EncryptionService.decode(pid, model.EncryptionSettings));
          });
        } else {
          if (pids)
            ids = EncryptionService.decode(pids, model.EncryptionSettings);
        }
        return resolve(ids);
      } catch (err) {
        resolve(0);
      }
    });
  },
  pidToIdSync: function(pids, model) {
    try {
      var ids = null;
      if (Array.isArray(pids)) {
        ids = [];
        pids.forEach(function(pid) {
          if (pid)
            ids.push(EncryptionService.decode(pid, model.EncryptionSettings));
        });
      } else {
        if (pids)
          ids = EncryptionService.decode(pids, model.EncryptionSettings);
      }
      return ids;
    } catch (err) {
      return pids;
    }
  },
  idToPid: function(ids, model) {
    return new Promise(function(resolve, reject) {
      try {
        var pids = null;
        if (Array.isArray(ids)) {
          pids = [];
          ids.forEach(function(id) {
            if (id)
              pids.push(EncryptionService.encode(id, model.EncryptionSettings));
          });
        } else {
          if (ids)
            pids = EncryptionService.encode(ids, model.EncryptionSettings);
        }
        return resolve(pids);
      } catch (err) {
        return reject(err);
      }
    });
  },
  idToPidSync: function(ids, model) {
    try {
      var pids = null;
      if (Array.isArray(ids)) {
        pids = [];
        ids.forEach(function(id) {
          if (id)
            pids.push(EncryptionService.encode(id, model.EncryptionSettings));
        });
      } else {
        if (ids)
          pids = EncryptionService.encode(ids, model.EncryptionSettings);
      }
      return pids;
    } catch (err) {
      return ids;
    }
  }
};