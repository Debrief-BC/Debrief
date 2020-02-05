'use strict';

module.exports = {
  /**
   * @api {get} /calendar
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName GetCalendars
   * @apiGroup Calendar
   * @apiDescription returns a list of calendars
   */

  find(req, res) {
    let transformRequest = TransformerService.calendar.get(req);
    let filterCalendars = () => {
      return Calendar.filter.find(req)
        .then((calendars) => {
          if (!calendars) return res.notFound();
          return calendars;
        })
        .catch(e => {
          throw new Error(e)
        });
    };

    transformRequest
      .then(filterCalendars)
      .then(TransformerService.calendar.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {get} /calendar/:id
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName GetCalendars
   * @apiGroup Calendar
   * @apiDescription returns the details of an individual calendar
   * @apiParam {string} id
   */

  findOne(req, res) {
    let transformRequest = TransformerService.calendar.get(req);
    let start_date = req.param('start');
    let end_date = req.param('end');

    let filterCalendar = function() {
      return Calendar.filter.findOne(req);
    };

    let getRemoteCalendar = (calendar_details) => {
      if (!calendar_details) {
        return null;
      }

      if (calendar_details.integration && calendar_details.integration.id && calendar_details.calendarId && req.param('events') == "true") {
        return Calendar.getRemoteCalendar(calendar_details, start_date, end_date)
      } else {
        return calendar_details;
      }
    }

    transformRequest
      .then(filterCalendar)
      .then(getRemoteCalendar)
      .then(TransformerService.calendar.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {post} /calendar
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName AddCalendar
   * @apiGroup Calendar
   * @apiPermission member
   * @apiDescription creates a new calendar
   * @apiParam {String} [integration]
   */

  create(req, res) {
    let validate = ValidatorService.calendar.validateCreate(req.body);
    let transformRequest = () => {
      return TransformerService.calendar.get(req);
    };

    let createCalOnProvider = () => {
      return Integration.findOne({
          id: req.body.integration
        }).then((integration) => {
          if (integration) {
            return Calendar.createCalendar(integration);
          }
        })
        .catch(e => {
          throw new Error(e)
        });
    };

    let createCalendar = (response) => {
      return Calendar.createAndPublish(req.body, req)
        .then((r) => {
          return response;
        }).catch(e => {
          throw new Error(e)
        });
    };

    validate
      .then(transformRequest)
      .then(createCalOnProvider)
      .then(createCalendar)
      .then(TransformerService.calendar.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /calendar/:id
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName EditCalendar
   * @apiGroup Calendar
   * @apiDescription Edits a calendar
   * @apiParam {string} id
   */

  update(req, res) {
    let validate = ValidatorService.calendar.validateUpdate(req);
    let transformRequest = () => {
      return TransformerService.calendar.get(req);
    };

    let updateCalendar = () => {
      return Calendar
        .updateAndPublish({
          id: req.param('id')
        }, req.body, req)
        .then(res.ok)
        .catch(res.generalError);
    };

    validate
      .then(transformRequest)
      .then(updateCalendar)
      .then(TransformerService.calendar.send)
      .then(res.ok)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /calendar/:id
   * @apiVersion 2.3.15
   * @apiIgnore
   * @apiName DeleteCalendar
   * @apiGroup Calendar
   * @apiDescription Deletes a calendar
   * @apiParam {string} id
   */
  destroy(req, res) {
    return Calendar.destroyAndPublish({
        id: req.param('id')
      }, req).then(() => {
        res.ok();
      })
      .catch(e => {
        throw new Error(e)
      });
  }
};