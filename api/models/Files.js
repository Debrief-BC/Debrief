'use strict';

/**
 * Files.js - Model that support files management within API
 *
 * IMPORTANT: The naming for this file is "Files" instead of "File", since
 * sails will attach it to the global object and break support for native JS
 * File functionality. Please DO NOT RENAME this to File.
 */
let Path = require('path');
let Promise = require('bluebird');
let SkipperS3 = require('skipper-better-s3');
let requestImageSize = require('request-image-size');

// let ImageMagick = {
// 	convert: function(opts) { return opts.srcData; }
// };
// try{
// 	ImageMagick = require('imagemagick-native');
// }catch(e){}
let fs = require('fs');

module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    extension: {
      type: 'string'
    },
    size: {
      type: 'integer'
    },
    thumbWidth: {
      type: 'integer'
    },
    thumbHeight: {
      type: 'integer'
    },
    filename: {
      type: 'string'
    },
    user: {
      model: 'user'
    },
    teamuser: {
      model: 'teamuser'
    },
    team: {
      model: 'team'
    },
    chat: {
      model: 'chat'
    },
    routing_audio: {
      type: 'boolean',
      defaultTo: false
    },
    url: {
      type: 'string'
    },
    thumb_url: {
      type: 'string'
    }
  },
  beforeCreate(values, cb) {
    if (values.team && values.user) {
      return TeamUser.findOne({
        user: values.user,
        team: values.team
      }).then(function(teamuser) {
        if (teamuser) values.teamuser = teamuser.id;
        cb();
      }).catch(cb);
    }
    cb();
  },
  afterCreate(created, cb) {
    cb();
    Search.create({
        name: created.filename,
        extension: created.extension,
        team: created.team,
        user: created.user,
        teamuser: created.teamuser
      },
      created.id,
      'files',
      created.chat);
  },
  afterUpdate(updated, cb) {
    cb();
    Files.findOne({
      id: updated.id
    }).then((file) => {
      Search.update({
        name: file.filename,
        extension: file.extension,
        team: file.team,
        user: file.user,
        teamuser: created.teamuser
      }, file.id, 'files');
    });
  },
  afterDestroy(deleted, cb) {
    cb();
    Search.destroy(deleted.id, 'files', deleted.chat);
  },

  upload(req, opts) {
    return new Promise(function(resolve, reject) {
      let origifile = req.file('file')._files[0].stream.filename;
      let filename = origifile;
      return Files.createFilePath(opts, filename).then(function(path) {
        let conf = {
          maxBytes: sails.config.s3.maxBytes,
          dirname: Path.resolve(sails.config.appPath, sails.config.uploadDir)
        };

        if (sails.config.s3) {
          conf = {
            maxBytes: sails.config.s3.maxBytes,
            adapter: SkipperS3,
            saveAs: path,
            key: sails.config.s3.key,
            secret: sails.config.s3.secret,
            bucket: sails.config.s3.bucket,
            headers: {
              'x-amz-acl': 'public-read'
            }
          };
        }

        req.file('file').upload(conf, function(err, files) {
          if (err) {
            return reject(err);
          }

          let allParams = req.allParams();

          let buildFileQuery = function() {
            return new Promise(function(resolve, reject) {
              let promises = [];
              let fileArray = [];

              files.forEach(function(file) {
                let promise = createFileData(file).then(function(fileData) {
                  fileArray.push(fileData);
                  return fileData;
                });
                promises.push(promise);
              })

              return Promise.all(promises).then(function(result) {
                return resolve(fileArray);
              })
            });
          };

          let createFileData = (file) => {
            return new Promise((resolve, reject) => {
              let imageTypes = ['jpg', 'jpeg', 'gif', 'png'];

              let fileDir = file.fd.split('/');
              let fileIndex = fileDir.length - 1;
              let fullFileName = fileDir[fileIndex];
              let fileParts = fullFileName.split('.');
              let fileName = file.fd;
              let fileExt = fileParts.pop().toLowerCase() || '';
              let thumbnail = null;

              let fileData = {
                name: escape(fileName),
                path: escape(file.fd),
                extension: fileExt,
                size: file.size,
                thumbWidth: thumbnail && thumbnail.width || null,
                thumbHeight: thumbnail && thumbnail.height || null,
                filename: escape(file.filename),
                url: file.extra.Location
              };

              if (opts.user) fileData.user = opts.user;
              if (opts.team) fileData.team = opts.team;
              if (opts.chat) fileData.chat = opts.chat;
              if (opts.routing_audio) fileData.routing_audio = opts.routing_audio;

              if (imageTypes.includes(fileExt)) {
                return generateThumbnail(file.fd, file.extra.Location).then((thumbnail) => {
                  fileData.thumbWidth = thumbnail && thumbnail.width || null;
                  fileData.thumbHeight = thumbnail && thumbnail.height || null;
                  fileData.thumb_url = thumbnail && thumbnail.url || null;
                  return resolve(fileData);
                })
              } else {
                return resolve(fileData);
              }
            })
          };

          let createFileRecord = (fileData) => {
            return Files.create(fileData).then((result) => {
              return resolve(result);
            }).catch((err) => {
              return reject(err);
            });
          };

          let generateThumbnail = (image, filePath) => {
            // return new Promise(function(resolve, reject) {

            return requestImageSize(filePath).then((size) => {

                let scalingFactor = Math.min(
                  460 / size.width,
                  360 / size.height
                );
                let newFile = Files.encodeS3URI(image)
                let width = scalingFactor * size.width;
                let height = scalingFactor * size.height;

                let response = {
                  width: width,
                  height: height,
                  url: sails.config.s3BaseUrl + newFile
                };

                return response;
              })
              .catch((e) => {
                throw new Error(e);
              });
            // });
          };

          buildFileQuery()
            .then(createFileRecord);

        });
      });
    });

  },
  createFilePath(opts, fileName) {
    let getPath = () => {
      return new Promise((resolve, reject) => {
        if (opts.team) {
          return Team.findOne(opts.team).then((team) => {
            if (opts.chat) {
              return Chat.idToPid(opts.chat).then((chat) => {
                return resolve(team.slug + "/chats/" + chat + "/" + fileName);
              })
            } else if (opts.user) {
              return TeamUser.idToPid(opts.user).then((user) => {
                return resolve(team.slug + "/users/" + user + "/" + fileName);
              })
            } else {
              return resolve(team.slug + "/" + fileName);
            }
          })
        } else {
          return resolve(fileName);
        }
      });
    }

    let checkExisting = function(path) {
      let newPath = path.replace(/\.[^/.]+$/, "");
      let extension = path.split('.').pop();
      let options = {
        key: sails.config.s3.key,
        secret: sails.config.s3.secret,
        bucket: sails.config.s3.bucket
      }
      let adapter = require('skipper-better-s3')(options);
      return new Promise(function(resolve, reject) {
        adapter.ls(newPath, function(err, files) {
          if (files.length > 0) {
            resolve(newPath + "(" + files.length + ")" + "." + extension);
          } else {
            resolve(path);
          }
        })
      });
    }
    return getPath()
      .then(checkExisting)
  },
  getLinksAndFiles: function(req) {

    if (!req.query) {
      req.query.limit = 30;
      req.query.skip = 0
    }

    let query = "(SELECT null as linkid, id as fileid, null as title, filename, user, chat, name, extension, filename, null as link, null as image, null as description, createdAt from files WHERE chat in (SELECT chat FROM chat_user WHERE user = '" + req.user + "') and team = '" + req.param('team') + "') union (SELECT links.id as linkid, null as fileid, title, null as filename, user, chat, null as name, null as extension, null as filename, link, image, description, links.createdAt from links left join chat on links.chat = chat.id WHERE chat in (SELECT chat FROM chat_user WHERE user = '" + req.user + "') and team = '" + req.param('team') + "') order by createdAt DESC limit " + req.query.limit + " offset " + req.query.skip;
    return Files.rawQuery(query);

  },
  //For future use, will upload a file from the api withought the need for a req obj
  uploadFromAPI: function(filePath, opts) {
    return new Promise(function(resolve, reject) {
      let conf = {
        maxBytes: 10000000,
        key: sails.config.s3.key,
        secret: sails.config.s3.secret,
        bucket: sails.config.s3.bucket,
        headers: {
          'x-amz-acl': 'public-read'
        }
      };
      let adapter = SkipperS3(conf);
      let receiver = adapter.receive();
      let fileStream = fs.createReadStream(Path.resolve("./.tmp/" + filePath + ".txt"));
      fileStream.fd = filePath + ".txt";
      receiver.write(fileStream, () => {
        let file = fileStream.extra;
        fs.unlinkSync(fileStream.path)
        buildFileQuery(file)
          .then(createFileRecord);
      })

      let buildFileQuery = function(file) {
        return new Promise(function(resolve, reject) {
          let imageTypes = ['jpg', 'jpeg', 'gif', 'png'];

          let fileDir = file.fd.split('/');
          let fileIndex = fileDir.length - 1;
          let fullFileName = fileDir[fileIndex];
          let fileParts = fullFileName.split('.');
          let fileName = file.fd;
          let fileExt = fileParts[1] || '';
          let thumbnail = null;

          if (_.includes(imageTypes, fileExt)) {
            thumbnail = generateThumbnail(file.fd, fullFileName);
          }


          let fileData = {
            name: escape(fileName),
            path: escape(file.fd),
            extension: fileExt,
            size: file.size,
            thumbWidth: thumbnail && thumbnail.width || null,
            thumbHeight: thumbnail && thumbnail.height || null,
            filename: escape(file.filename)
          };

          if (opts.user) fileData.user = opts.user;
          if (opts.team) fileData.team = opts.team;
          if (opts.chat) fileData.chat = opts.chat;
          if (opts.routing_audio) fileData.routing_audio = opts.routing_audio;

          return resolve(fileData);
        });
      };

      let createFileRecord = function(fileData) {
        return Files.create(fileData).then(function(result) {
          return resolve(result);
        }).catch(function(err) {
          return reject(err);
        });
      };

      let generateThumbnail = function(image, file) {
        let thumbpath = Path.resolve(sails.config.appPath, sails.config.uploadDir + '/thumb/' + file);
        let width = 100;
        let height = 100;

        let response = {
          width: width,
          height: height
        };

        return response;
      };
    });
  },
  encodeS3URI: function(filename) {
    return encodeURI(filename)
      .replace(/\+/img, "%2B")
      .replace(/\!/img, "%21")
      .replace(/\"/img, "%22")
      .replace(/\#/img, "%23")
      .replace(/\$/img, "%24")
      .replace(/\&/img, "%26")
      .replace(/\'/img, "%27")
      .replace(/\(/img, "%28")
      .replace(/\)/img, "%29")
      .replace(/\*/img, "%2A")
      .replace(/\+/img, "%2B")
      .replace(/\,/img, "%2C")
      .replace(/\:/img, "%3A")
      .replace(/\;/img, "%3B")
      .replace(/\=/img, "%3D")
      .replace(/\?/img, "%3F")
      .replace(/\@/img, "%40");

  }

};