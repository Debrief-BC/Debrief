'use strict';

module.exports = {
  /**
   * @api {get} /country
   * @apiVersion 2.3.15
   * @apiName GetGeo
   * @apiGroup Geo
   * @apiDescription returns a list of countries
   */
  find(req, res) {

    let transformRequest = TransformerService.country.get(req);

    let getCountries = () => {
      return Country.filter.find(req).then((countries) => {
        if (!countries) return res.notFound();
        return countries;
      }).catch((err) => {
        throw new Error(err)
      });
    };

    transformRequest
      .then(getCountries)
      .then(TransformerService.country.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);

  }
};