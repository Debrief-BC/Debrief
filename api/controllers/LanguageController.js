/**
 * LanguageController
 *
 * @description :: Server-side logic for managing Languages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * @api {GET} /language/:id
   * @apiVersion 2.3.15
   * @apiName FindLanguage
   * @apiGroup Language
   *
   * @apiDescription This returns a list of all languages
   *
   * @apiParam {integer} id the language id
   *
   * @apiUse contact
   */
  find: function(req, res) {
    var transformRequest = TransformerService.language.get(req);

    let filterLanguage = () => {
      return Language.filter.find(req);
    }

    transformRequest
      .then(filterLanguage)
      .then(TransformerService.language.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {GET} /language/:id
   * @apiVersion 2.3.15
   * @apiName FindOneLanguage
   * @apiGroup Language
   *
   * @apiDescription This returns a specific language
   *
   * @apiParam {integer} id the language id or the locale string ie(enUS, enMX, etc.)
   *
   * @apiUse contact
   */
  findOne: function(req, res) {
    var transformRequest = TransformerService.language.get(req);

    let filterLanguage = () => {
      var id = req.param('id');

      return Language.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      }).then(function(language) {
        if (!language) return res.notFound();
        return language;
      }).catch(err => {
        throw new Error(err);
      });

    };

    transformRequest
      .then(filterLanguage)
      .then(TransformerService.language.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {patch} /language/:id
   * @apiVersion 2.3.15
   * @apiName EditLanguage
   * @apiGroup Language
   *
   * @apiDescription This edits a Language
   *
   * @apiParam {integer} id the language id
   * @apiParam (body) {Language} body of the language object
   *
   * @apiUse contact
   */
  update: function(req, res) {
    var validate = ValidatorService.language.validateUpdate(req);
    var transformRequest = function() {
      return TransformerService.language.get(req);
    };

    var updateLanguage = function() {
      return Language.update({
        id: req.param('id')
      }, req.body).then(function(language) {
        return language;
      }).catch(err => {
        throw new Error(err);
      });
    };

    validate
      .then(transformRequest)
      .then(updateLanguage)
      .then(TransformerService.language.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /language/:id
   * @apiVersion 2.3.15
   * @apiName CreateLanguage
   * @apiGroup Language
   *
   * @apiDescription This creates a Language
   *
   * @apiParam {integer} id the language id
   * @apiParam (body) {Language} body of the language object
   *
   * @apiUse contact
   */
  create: function(req, res) {
    let validate = ValidatorService.language.validateCreate(req);
    var transformRequest = TransformerService.language.get(req);

    var createlanguage = function() {
      return Language.create(req.body).catch(err => {
        throw new Error(err);
      });
    };

    validate
      .then(createlanguage)
      .then(TransformerService.language.send)
      .then(res.created)
      .catch(res.serverError);
  }
};