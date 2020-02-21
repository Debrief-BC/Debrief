'use strict';

/**
 * 204 (No Content) Response
 *
 * Usage:
 * return res.noContent();
 * return res.noContent();
 * return res.noContent('auth/login');
 *
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function sendNoContent(options) {
  var data = [];

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  sails.log.silly('res.noContent() :: Sending 204 ("No Content") response');

  // Set status code
  res.status(204);

  // If appropriate, serve data as JSON(P)
  // If views are disabled, revert to json
  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx(data);
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? {
    view: options
  } : options || {};

  // Attempt to prettify data for views, if it's a non-error object
  var viewData = data;
  if (!(viewData instanceof Error) && 'object' == typeof viewData) {
    try {
      viewData = require('util').inspect(data, {
        depth: null
      });
    } catch (e) {
      viewData = undefined;
    }
  }

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, {
      data: viewData,
      title: 'NoContent'
    });
  }

  // If no second argument provided, try to serve the implied view,
  // but fall back to sending JSON(P) if no view can be inferred.
  else return res.guessView({
    data: viewData,
    title: 'NoContent'
  }, function couldNotGuessView() {
    return res.jsonx(data);
  });

};