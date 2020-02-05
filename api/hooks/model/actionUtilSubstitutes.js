'use strict';

module.exports = {
  /**
   * Given a Waterline query and an express request, populate
   * the appropriate/specified association attributes and
   * return it so it can be chained further ( i.e. so you can
   * .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Request} req
   * @return {Query}
   */
  populateRequest: function(query, req) {
    var DEFAULT_POPULATE_LIMIT = req._sails.config.blueprints.defaultLimit || 30;
    var _options = req.options;
    var aliasFilter = req.param('populate');
    var shouldPopulate = _options.populate;

    // Convert the string representation of the filter list to an Array. We
    // need this to provide flexibility in the request param. This way both
    // list string representations are supported:
    //   /model?populate=alias1,alias2,alias3
    //   /model?populate=[alias1,alias2,alias3]
    if (typeof aliasFilter === 'string') {
      aliasFilter = aliasFilter.replace(/\[|\]/g, '');
      aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
    }

    var aliasCriteria = {};
    var aliasSort = {};
    var aliasLimit = {};

    _.each(aliasFilter, function(val, key) {
      if (typeof val === 'string') {
        aliasCriteria[val] = {};
        aliasSort[val] = {};
      } else if (val.name) {
        aliasCriteria[val.name] = val.where || {};
        aliasSort[val.name] = val.sort || {};
        aliasLimit[val.name] = val.limit;
        aliasFilter[key] = val.name;
      }
    });

    var associations = [];

    _.each(_options.associations, function(association) {
      // If an alias filter was provided, override the blueprint config.
      if (aliasFilter) {
        shouldPopulate = _.contains(aliasFilter, association.alias);
      }

      // Only populate associations if a population filter has been supplied
      // with the request or if `populate` is set within the blueprint config.
      // Population filters will override any value stored in the config.
      //
      // Additionally, allow an object to be specified, where the key is the
      // name of the association attribute, and value is true/false
      // (true to populate, false to not)
      if (shouldPopulate) {
        var populationLimit =
          _options['populate_' + association.alias + '_limit'] ||
          _options.populate_limit ||
          _options.limit ||
          DEFAULT_POPULATE_LIMIT;

        associations.push({
          alias: association.alias,
          limit: aliasLimit[association.alias] || populationLimit,
          where: aliasCriteria[association.alias],
          sort: aliasSort[association.alias]
        });
      }
    });

    return this.populateQuery(query, associations, req._sails);
  },
  /**
   * Given a Waterline query, populate the appropriate/specified
   * association attributes and return it so it can be chained
   * further ( i.e. so you can .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Array} associations  [array of objects with an alias
   *                                and (optional) limit key]
   * @return {Query}
   */
  populateQuery: function(query, associations, sails) {
    var DEFAULT_POPULATE_LIMIT = (sails && sails.config.blueprints.defaultLimit) || 30;

    return _.reduce(associations, function(query, association) {
      return query.populate(association.alias, {
        limit: association.limit || DEFAULT_POPULATE_LIMIT,
        where: association.where || {},
        sort: association.sort || {}
      });
    }, query);
  }
}