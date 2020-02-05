/**
 * LocaleController
 *
 * @description :: Server-side logic for managing Locales
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * @api {GET} /locale/
   * @apiVersion 2.3.15
   * @apiName FindLanguage
   * @apiGroup Language
   *
   * @apiDescription This returns a list of all locales
   *
   * @apiParam {integer} id the language id
   *
   * @apiUse contact
   */
  find: function(req, res) {
    let transformRequest = TransformerService.locale.get(req);
    let findLocales = () => {
      return Locale.filter.find(req);
    };

    transformRequest
      .then(findLocales)
      .then(TransformerService.locale.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {GET} /locale/:id
   * @apiVersion 2.3.15
   * @apiName FindLanguage
   * @apiGroup Language
   *
   * @apiDescription This returns a specific locale, locales can be searched
   * by id or locale name (enUS, en-us, en_us)
   *
   * @apiParam {integer} id the language id
   *
   * @apiUse contact
   */
  findOne: function(req, res) {
    var transformRequest = TransformerService.locale.get(req);

    let filterLocale = () => {
      var id = req.param('id');
      var findObj = {
        id: req.param('id')
      };

      if (isNaN(id)) {
        findObj = {
          locale: id
        };
      }

      return Locale.filter.findOne(req, {
        find: findObj
      }).then(function(locale) {
        if (!locale) return res.notFound();
        return locale;
      }).catch(err => {
        throw new Error(err);
      });

    };

    transformRequest
      .then(filterLocale)
      .then(TransformerService.locale.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {PATCH} /locale/:id
   * @apiVersion 2.3.15
   * @apiName FindLanguage
   * @apiGroup Language
   *
   * @apiDescription Update a specific locale
   *
   * @apiParam {integer} id the language id
   *
   * @apiUse contact
   */
  update: function(req, res) {
    var validate = ValidatorService.locale.validateUpdate(req);
    var transformRequest = function() {
      return TransformerService.locale.get(req);
    };

    var updateLocale = function() {
      return Locale.update({
        id: req.param('id')
      }, req.body).catch(err => {
        throw new Error(err);
      });
    };

    validate
      .then(transformRequest)
      .then(updateLocale)
      .then(TransformerService.locale.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {POST} /locale/
   * @apiVersion 2.3.15
   * @apiName FindLanguage
   * @apiGroup Language
   *
   * @apiDescription This create a locale and a language
   *
   * @apiParam {integer} id the language id
   *
   * @apiUse contact
   */
  create: function(req, res) {
    let validate = ValidatorService.locale.validateCreate(req);

    var createlanguage = function() {
      var languageBody = {
        body: req.body.body,
      }

      return Language.create(languageBody).then(function(lang) {
        return createlocale(lang.id);
      }).catch(err => {
        throw new Error(err);
      });
    };

    var createlocale = function(lang) {
      var localeBody = {
        locale: req.body.locale,
        value: req.body.value,
        label: req.body.label,
        language: lang
      }

      return Locale.create(localeBody).catch(err => {
        throw new Error(err);
      });
    };

    validate
      .then(createlanguage)
      .then(TransformerService.locale.send)
      .then(res.created)
      .catch(res.serverError);
  },

  /**
   * @api {DELETE} /locale/:id
   * @apiVersion 2.3.15
   * @apiName FindLanguage
   * @apiGroup Language
   *
   * @apiDescription This deletes a locale
   *
   * @apiParam {integer} id the language id
   *
   * @apiUse contact
   */
  destroy: function(req, res) {
    return res.ok("not implemented yet");
  }
};