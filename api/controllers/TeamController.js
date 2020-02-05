'use strict';

var faker = require('faker');

/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * This functionality does not exist. Querying all teams should not be available
   * (disabled in routes)
   * @return {Array[]}     [404 path not found]
   */
  find(req, res) {
    let transformRequest = TransformerService.team.get(req);
    let filterTeams = () => {
      return Team.filter.find(req);
    };

    transformRequest
      .then(filterTeams)
      .then(TransformerService.team.send)
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {get} /team/:id
   * @apiVersion 2.3.15
   * @apiName GetTeam
   * @apiGroup Team
   *
   * @apiDescription Gets the details of a specific team.
   * @apiParam id The team's id.
   * @apiUse populate
   *
   * @apiParam (Populate) [users]
   * @apiParam (Populate) [departments]
   *
   * @apiSuccess {Team} body the team object
   *
   * @apiUse minimalTeam
   * @apiUse fullTeam
   * @apiUse apiObjectDefaults
   *
   * @apiUse minimalUser
   * @apiUse minimalChat
   * @apiUse minimalDepartment
   */
  findOne(req, res) {
    let transformRequest = TransformerService.team.get(req);
    let filterTeam = () => {
      return Team.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      });
    };

    transformRequest
      .then(filterTeam)
      .then(TransformerService.team.send)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /team/:id/info
   * @apiVersion 2.3.15
   * @apiName GetTeamInfo
   * @apiGroup Team
   *
   * @apiDescription Gets limited details for a team(public access)
   * @apiParam id The team's id.
   *
   * @apiSuccess {Team} body the team object
   *
   * @apiUse minimalTeam
   */

  getTeamInfo(req, res) {
    let transformRequest = TransformerService.team.get(req);
    let filterTeam = () => {
      return Team.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      });
    };

    transformRequest
      .then(filterTeam)
      .then(TransformerService.team.sendInfo)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {get} /team/:id/status
   * @apiVersion 2.3.15
   * @apiName CheckTeamStatus
   * @apiGroup Team
   *
   * @apiDescription Checks the team status for paywall and fusebill standing
   * @apiParam id The team's id.
   *
   * @apiSuccess {Team} body the team object
   *
   * @apiUse minimalTeam
   */

  checkTeamStatus(req, res) {
    const transformRequest = TransformerService.team.get(req);
    let filterTeam = () => {
      return Team.filter.findOne(req, {
        find: {
          id: req.param('id')
        }
      }).catch((err) => {
        throw new Error(err);
      });
    };

    let checkFusebillStatus = (team) => {
      return Customer.overview(team.billingId).then((customer) => {
          if (customer.status === "Draft") {
            return Customer.activate(customer.id).then((customer) => {
              return team;
            }).catch((err) => {
              return team;
            }).catch((err) => {
              sails.log.error('err', err);
              return team;
            })
          } else {
            return team;
          }
        })
        .catch((err) => {
          return team;
        });
    }

    let checkStatus = (team) => {
      if (team) {
        switch (team.activated) {
          case 'pending':
            //Check if its been 14 days since active
            let currentDate = new Date();
            let timeDiff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(team.createdAt.getFullYear(), team.createdAt.getMonth(), team.createdAt.getDate())) / (1000 * 60 * 60 * 24));
            if (timeDiff > 14) {
              //Check if user has a creditcard
              return CreditCards.getDefault(team.billingId).then((card) => {
                return Team.updateAndPublish({
                  id: team.id
                }, {
                  activated: "paywall"
                }).then((team) => {
                  return team[0].activated;
                });
              }).catch((err) => {
                sails.log.error('default_card_err', err);
                return team.activated;
              });
            } else {
              return team.activated;
            }
            break;
          case 'active':
            if (team.billingId) {
              return CreditCards.getDefault(team.billingId).then((card) => {
                if (!card) {
                  return Team.updateAndPublish({
                    id: team.id
                  }, {
                    activated: "paywall"
                  }).then((team) => {
                    return team[0].activated;
                  }).catch((err) => {
                    sails.log.error('err', err);
                    return team.activated;
                  })
                } else {
                  return team.activated;
                }
              }).catch((err) => {
                console.log('active_card_err', err);
                return team.activated;
              });
            } else {
              return createBillingCustomer(team)
                .then(subscribePlan);
            }
            break;
          case 'paywall':
            if (team.billingId) {
              return team.activated;
            } else {
              return createBillingCustomer(team)
            }
            break;
          default:
            return team;
        }
      }
    };

    let createBillingCustomer = (team) => {
      if (team) {
        return User.findOne({
          id: team.user.user
        }).then((user) => {
          //Salesforce integration required before adding ID
          let customer = {
            firstName: user.firstname,
            lastName: user.lastname,
            primaryEmail: user.email,
            companyName: team.name,
            //salesforceId: team.salesforce.id
          };

          return Team.createBillingCustomer(customer).then((customer) => {
            return Team.update(team.id, {
              billingId: customer.id
            }).then((res) => {
              team.billingId = customer.id;
              return team.activated;
            }).catch((err) => {
              throw new Error(err);
            });
          }).catch((err) => {
            throw new Error(err);
          });

        }).catch((err) => {
          throw new Error(err);
        });
      }
    };

    transformRequest
      .then(filterTeam)
      .then(checkFusebillStatus)
      .then(checkStatus)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {post} /team
   * @apiVersion 2.3.15
   * @apiName CreateTeam
   * @apiGroup Team
   *
   * @apiDescription Creates a new team
   *
   * @apiParam (body) {Team} body the new team object
   * @apiUse minimalTeam
   */
  create(req, res) {
    const validate = ValidatorService.team.validateCreate(req.body);

    const transformRequest = () => {
      return TransformerService.team.get(req)
    };

    let owner = null;

    let createTeam = () => {
      req.body.slug = req.body.slug || req.body.name.toLowerCase().split(' ').join('-').replace(/[^a-zA-Z0-9-]/g, "");
      owner = req.body.owner;
      req.body.autoreception = 'not-started';
      req.body.activated = 'pending';

      return Team.createAndPublish(req.body);
    };

    let createTeamUser = (result) => {

      return Plan.find({
        country: result.country,
        defaultPlan: true
      }).then((plan) => {
        let planId = 1;
        if (plan && plan.length > 0) planId = plan[0].id;

        return TeamUser
          .create({
            user: owner,
            team: result.id,
            role: 1,
            plan: planId,
            invitedBy: owner,
            accepted: new Date().toISOString()
          }).then((r) => {
            result.user = r;
            Team.update({
              id: result.id
            }, {
              owner: owner
            })
            return result;
          }).catch((e) => {
            return e;
          });
      });
    };

    let createCallRoute = (result) => {

      CallRoute.createUserRoute(result.user, result.user.team, 100)
        .catch((err) => {
          console.error(err);
        });

      return result
    };

    let addSalesforceLead = (team) => {
      let lead = {
        type: 'Account',
        Name: team.name
      };

      return Salesforce.create(lead).then((r) => {
        team.salesforce = r;
        return team;
      }).catch((e) => {
        console.log(e);
        return team;
      });

    };

    let createBillingCustomer = (team) => {

      return User.findOne({
        id: team.user.user
      }).then((user) => {
        //Salesforce integration required before adding ID
        let customer = {
          firstName: user.firstname,
          lastName: user.lastname,
          primaryEmail: user.email,
          companyName: team.name,
          //salesforceId: team.salesforce.id
        };

        return Team.createBillingCustomer(customer).then((customer) => {
          return Team.update(team.id, {
            billingId: customer.id
          }).then((res) => {
            team.billingId = customer.id;
            return team;
          }).catch(err => {
            return team;
          });
        });

      }).catch((err) => {
        console.log('err', err);
        return team;
      });
    };

    let addContactToSaleForce = (team) => {
      return User.findOne({
        id: team.user.user
      }).then((user) => {

        let contact = {
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          role__c: "manager"
        };

        Salesforce.createContact(team.name, contact)
          .catch((e) => {
            console.log(e);
          });
        return team;
      }).catch((err) => {
        console.error(err);
      });
    };

    let sendEmail = (team) => {
      let getUser = () => {
        return User.findOne({
          id: team.user.user
        });
      };

      let postEmail = (user) => {
        Team.sendEmail("Welcome", user, team);
        return team;
      };

      return getUser()
        .then(postEmail)
    };

    let addTeamChat = (team) => {
      return Chat.createChat({
        name: team.name,
        type: "room",
        purpose: sails.config.defaultRoom.purpose || '',
        team: team.id,
        users: [team.user.user],
        url: team.slug,
        pin: faker.random.number(9999)
      }, req).then(chat => {
        if (chat) {
          return ChatUser.update({
              chat: chat.id,
              user: team.user.id
            }, {
              favorite: true
            })
            .then(chatuser => {
              let body = {
                type: 'debrief_hq',
                team: team.id,
                chat: chat.id,
                body: sails.config.defaultRoom.message
              };

              return ChatMessage.createAndPublish(body, req)
                .then(message => {
                  Queue.addChat(
                    Chat.idToPidSync(chat.id),
                    TeamUser.idToPidSync(chatuser.id)
                  );
                })
                .then(() => team)
                .catch(err => {
                  console.log(err);
                  return team;
                });
            })
            .catch(err => {
              console.log(err);
              return team;
            });
        } else {
          return team;
        }
      }).catch(err => {
        console.log(`err ${err}`);
        return team;
      });
    }

    let updateAffiliate = (team) => {
      if (req.body.ref) {
        return Affiliate.createReferal(req.body.ref, team).then((result) => {
          if (result.referral_id) {
            return Team.update(team.id, {
              affiliate: result.referral_id
            }).then((res) => {
              return team;
            }).catch((err) => {
              console.error(err);
              return team;
            });
          } else {
            return team;
          }
        }).catch((err) => {
          console.log(err);
          return team;
        });
      } else {
        return team;
      }
    };

    // Determine timezone
    const timezone = (team) => {
      let city = req.param('city');
      let state = req.param('state');
      let country = req.param('country');

      Team.findTimeZone(team.id, team.user.id, country, state, city);
      return team;
    }


    // Pick DID number;
    let setupAutoReception = (team) => {

      let didNumber = null;

      const getCountries = () => {
        const options = {
          pageNumber: req.param("pageNumber") ? req.param("pageNumber") : "0",
          pageSize: req.param("pageSize") ? req.param("pageSize") : "195"
        }
        return DidNumber.listCountries(options).then(countries => {
          if (countries) {
            let country = countries.filter(country => {
              if (country.countryName === req.param('country').toUpperCase()) {
                return country;
              }
            });

            return country;
          } else {
            return {};
          }

        }).catch(err => {
          throw new Error(err);
        });
      };

      const getStates = (country) => {
        return DidNumber.listStates(country[0].countryCodeA3)
          .then(states => {
            if (states) {
              let state = states.filter(state => {
                if (state.stateName === (req.param('state'))) {
                  return state;
                }
              });

              return {
                country: country,
                state: state
              };
            } else {
              return {};
            }
          }).catch(err => {
            throw new Error(err);
          });
      };

      const findDidGroup = (states) => {

        let stateId;
        let city = req.param('city') ? req.param('city') : null;

        const camelize = (str) => {
          return str
            .replace(/\s(.)/g, ($1) => {
              return $1.toUpperCase();
            })
            .replace(/\s/g, '')
            .replace(/^(.)/, ($1) => {
              return $1.toLowerCase();
            });
        }

        if (states.state && states.state.length > 0) {
          stateId = states.state[0].stateId;
        } else {
          stateId = null;
        }

        if (!states.country) {
          throw new Error('No country found');
        }

        if (city) {
          city = camelize(city);
        }

        let options = {
          pageNumber: req.param("pageNumber") ? req.param("pageNumber") : "0",
          pageSize: req.param("pageSize") ? req.param("pageSize") : "1000",
          country: states.country[0].countryCodeA3,
          state: stateId,
          city: city
        };

        return DidNumber.listDidGroups(options)
          .then(didGroup => {
            if (didGroup) {
              return didGroup[0];
            } else {
              options.city = null;

              return DidNumber.listDidGroups(options).then(didGroup => {
                if (didGroup) {
                  return didGroup[0];
                }
              }).catch(err => {
                throw new Error(err);
              });
            }
          }).catch(err => {
            throw new Error(err);
          });
      };

      const createCart = (didGroup) => {
        return DidNumber.createCart(team.name, "Autoreception DID Order")
          .then(cart => {
            cart.didGroup = didGroup;
            return cart;
          })
          .catch(err => {
            console.log(err)
            return didGroup;
          });
      };

      const orderDID = (cart) => {
        let didOrder = {
          "didGroupId": cart.didGroup.didGroupId,
          "quantity": "1"
        };

        return DidNumber.addDIDToCart(cart.cartIdentifier, didOrder).then((item) => {
          if (item.status === "SUCCESS") {
            return DidNumber.checkoutCart(cart.cartIdentifier);
          }
        }).catch(err => {
          console.log(`did_add_to_cart ${err}`);
          return cart;
        });
      };

      const checkOrder = (cart) => {
        if (cart.status === "SUCCESS") {
          return DidNumber.listOrder(cart.productCheckoutList[0].orderReference).then((order) => {
            return DidNumber.listDids(cart.productCheckoutList[0].orderReference);
          }).catch(err => {
            console.log(`did_check_order ${err}`);
            return cart;
          });
        }
      };

      const createVoiceURI = (dids) => {
        if (dids) {
          didNumber = dids[0].e164.replace(/^\+/, '');
          return DidNumber.createVoiceURI(`${didNumber}@${sails.config.autoreception.uri}`, `${didNumber}@${sails.config.autoreception.uri} to ${team.name} Autoreception`)
            .then((voiceURI) => {
              return DidNumber.applyConfiguration(dids[0].didId, voiceURI.voiceUriId);
            }).catch(err => {
              console.log(`did_create_voice_uri ${err}`);
              return dids;
            });
        }
      };

      const createDIDCallRoute = (voiceURI) => {
        return CallRoute.createAutoreceptionRoute("Autoreception", team.id, 100);
      }

      const createDidNumber = (callRoute) => {
        return DidNumber.createAndPublish({
          name: `${team.name} Main`,
          number: didNumber,
          team: team.id,
          call_route: callRoute.id
        });
      };

      const updateTeamSettings = (didnum) => {
        return Team.update(team.id, {
          autoreception: 'completed',
          caller_id_number: didnum.number
        });
      }

      getCountries()
        .then(getStates)
        .then(findDidGroup)
        .then(createCart)
        .then(orderDID)
        .then(checkOrder)
        .then(createVoiceURI)
        .then(createDIDCallRoute)
        .then(createDidNumber)
        .then(updateTeamSettings)
        .catch(res.generalError);

      return team

    };

    validate
      .then(transformRequest)
      .then(createTeam)
      .then(createTeamUser)
      .then(addTeamChat)
      .then(timezone)
      .then(setupAutoReception)
      .then(createCallRoute)
      .then(addSalesforceLead)
      .then(createBillingCustomer)
      .then(addContactToSaleForce)
      .then(sendEmail)
      .then(updateAffiliate)
      .then(TransformerService.team.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /team/:id
   * @apiVersion 2.3.15
   * @apiName UpdateTeam
   * @apiGroup Team
   *
   * @apiDescription updates a team
   * @apiParam id The team's id.
   * @apiParam (body) {Team} body any changed fields from the team object
   * @apiUse minimalTeam
   */

  update: function(req, res) {

    let validate = ValidatorService.team.validateUpdate(req.body);
    let transformRequest = function() {
      return TransformerService.team.get(req);
    };

    let makeSlug = function() {
      if (req.body.team_name) {
        req.body.slug = req.body.slug || req.body.team_name.toLowerCase().split(' ').join('-');
      }
    };

    let uploadAvatar = function() {
      if (req.body.avatar === 'true') {
        return Files.upload(req, {
          team: req.param('id')
        }).then(function(file) {
          if (file[0]) {
            req.body.team_avatar = file[0].url;
          }
        });
      }
    };

    let updateHoldMusic = function() {
      if (req.body.hold_music == 'true') {
        return Files.upload(req, {
          team: req.param('id')
        }).then(function(file) {
          if (file[0]) {
            req.body.hold_music = JSON.stringify({
              name: file[0].filename,
              url: file[0].url
            });
          } else {
            req.body.hold_music = null;
          }
        });
      }
    };

    let updateTeam = function() {
      if (req.body.country && !req.isSuperAdmin) delete req.body.country;
      if (!req.isSuperAdmin) delete req.body.activated;

      return Team.updateAndPublish({
        id: req.param('id')
      }, req.body, req);
    };

    validate
      .then(transformRequest)
      .then(makeSlug)
      .then(uploadAvatar)
      .then(updateHoldMusic)
      .then(updateTeam)
      .then(TransformerService.team.send)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {delete} /team/:id
   * @apiVersion 2.3.15
   * @apiName DeleteTeam
   * @apiGroup Team
   *
   * @apiDescription Deletes a team
   * @apiParam id The team's unique id.
   */

  destroy: function(req, res) {
    let transformRequest = () => {
      return TransformerService.team.get(req);
    }

    let removeAllTeamUsers = () => {
      return TeamUser
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllChatUsers = () => {
      return ChatUser
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllChats = () => {
      return Chat
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllCallRoutes = () => {
      return CallRoute
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    };

    let removeAllCallLogs = () => {
      return CallLog
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllChannels = () => {
      return Channel
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllDids = () => {
      return DidNumber
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllFiles = () => {
      return Files
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeAllNotifications = () => {
      return Notifications
        .updateAndPublish({
          team: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    let removeTeam = () => {
      return Team
        .updateAndPublish({
          id: req.param('id')
        }, {
          deletedAt: new Date().toISOString()
        }, req)
        .then(res.ok({
          success: true
        }))
        .catch(res.serverError);
    }

    transformRequest()
      .then(removeAllTeamUsers)
      .then(removeAllChatUsers)
      .then(removeAllChats)
      .then(removeAllCallRoutes)
      .then(removeAllCallLogs)
      .then(removeAllChannels)
      .then(removeAllDids)
      .then(removeTeam)
  },

  /**
   * @api {post} /team/exist
   * @apiVersion 2.3.15
   * @apiName TeamExist
   * @apiGroup Team
   *
   * @apiDescription Checks if a team already exists
   *
   * @apiParam (body) {Team} body the new team object
   * @apiUse minimalTeam
   */

  exist: function(req, res) {
    let validate = ValidatorService.team.validateExists(req.body);
    return validate.then(res.ok).catch(res.badRequest);
  },

  /**
   * @api {post} /team/:id/customer
   * @apiVersion 2.3.15
   * @apiName TeamAccount
   * @apiGroup Team
   *
   * @apiDescription Creates a billing
   *
   * @apiParam (body) {Team} body the new team object
   * @apiUse minimalTeam
   */

  customer: function(req, res) {
    let validate = ValidatorService.team.validateAccount(req.body);
    let transformRequest = TransformerService.team.getAccount(req);

    let createCustomer = function() {
      return Customer.create(req.body);
    };

    let activateCustomer = function(customer) {
      customer.status = 'Active';
      return Customer.update(customer);
    };

    let updateTeamBilling = function(r) {
      return Team.updateAndPublish({
          id: req.param('id')
        }, {
          billingId: r.id
        }, req)
        .then(function(team) {
          return r;
        }).catch(function(e) {
          return e;
        });
    };

    validate
      .then(transformRequest)
      .then(createCustomer)
      .then(activateCustomer)
      .then(updateTeamBilling)
      .then(TransformerService.team.sendAccount)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {post} /team/:id/subscribe
   * @apiVersion 2.3.15
   * @apiName TeamAccount
   * @apiGroup Team
   *
   * @apiDescription Creates a billing subscription
   *
   * @apiParam (body) {Subscription} body the new subscription object
   * @apiUse minimalTeam
   */

  subscribe: function(req, res) {
    let validate = ValidatorService.team.validateSubscribe(req);
    let transformRequest = TransformerService.customer.getSubscription(req);
    let team = {};
    let planCount = [];

    let getTeam = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(result) {
        team = result;
        return team;
      })
    };

    let checkCreditCard = function(team) {
      return new Promise(function(resolve, reject) {
        return CreditCards.getDefault(team.billingId).then(function(card) {
          if (!card) {
            reject("A credit card is required to subscribe team");
          } else {
            resolve(team);
          }
        });
      });
    };

    let getUsers = function(team) {
      return TeamUser.find({
        team: team.id,
        deletedAt: null,
        role: {
          "!": sails.config.guestRoleIndex
        }
      }).then(function(users) {
        let plans = _.pluck(users, 'plan');
        planCount = _.countBy(plans, function(num) {
          return num;
        });
        return users;
      })
    };

    let countSubscriptions = function(users) {
      let promises = [];
      Object.keys(planCount).forEach(function(key) {
        let promise = Plan.findOne({
          id: key
        }).then(function(plan) {
          return subscribePlan(plan, planCount[key]);
        })
        promises.push(promise);
      })
      return Promise.all(promises);
    };

    let validateCoupon = function(users) {
      return new Promise(function(resolve, reject) {
        if (req.body.couponCode) {
          return Subscription.validateCoupon(req.body.couponCode).then(function(coupon) {
            if (!coupon.valid) {
              reject("Coupon is invalid")
            } else {
              resolve(users)
            }
          })
        } else {
          resolve(users);
        }
      });
    };

    let subscribePlan = function(plan, quantity) {
      return Customer.listPlans({
        query: "code:" + plan.code
      }).then(function(availablePlans) {
        let frequencys = _.pluck(availablePlans[0].planFrequencies, 'interval');
        //Default Monthly frequency
        let index = _.indexOf(frequencys, "Monthly");
        let subscription = {
          customerId: team.billingId,
          code: plan.code,
          name: plan.name,
          planFrequencyId: availablePlans[0].planFrequencies[index].id
        };
        return Subscription.create(subscription).then(function(subscription) {
          subscription.subscriptionProducts[0].quantity = quantity;
          if (req.body.couponCode) {
            return Subscription.updateSubscription(subscription).then(function(subscription) {
              return Subscription.applyCoupon(subscription.id, req.body.couponCode).then(function(coupon) {
                return Subscription.activate(subscription.id);
              });
            });
          } else {
            return Subscription.updateSubscription(subscription).then(function(subscription) {
              return Subscription.activate(subscription.id);
            });
          }
        });
      });
    };

    let updateStatus = function(subscriptions) {
      if (subscriptions) {
        return Team.update({
          id: team.id
        }, {
          activated: "active"
        }).then(function(team) {
          return team[0];
        })
      } else {
        return Team.findOne({
          id: team.id
        });
      }

    };

    let updateAffiliate = function(team) {
      if (team.affiliate && team.activated === "active") {
        return Customer.overview(team.billingId).then(function(overview) {
          return Affiliate.updateReferal({
            id: team.affiliate,
            team: team,
            status: "unpaid"
          }).then(function(result) {
            return team;
          });
        });
      } else {
        return team;
      }
    };


    transformRequest
      .then(validate)
      .then(getTeam)
      .then(checkCreditCard)
      .then(validateCoupon)
      .then(getUsers)
      .then(countSubscriptions)
      .then(updateStatus)
      .then(updateAffiliate)
      .then(TransformerService.team.send)
      .then(res.created)
      .catch(res.generalError);
  },

  /**
   * @api {post} /team/:id/previewsubscribe
   * @apiVersion 2.3.15
   * @apiName TeamAccount
   * @apiGroup Team
   *
   * @apiDescription returns a sample invoice of charges
   *
   * @apiUse minimalTeam
   */

  previewSubscribe: function(req, res) {
    let validate = ValidatorService.team.validateSubscribe(req);
    let transformRequest = TransformerService.customer.getSubscription(req);
    let team = {};
    let planCount = [];

    let getTeam = function() {
      return Team.findOne({
        id: req.param('id')
      }).then(function(result) {
        team = result;
        return team;
      })
    };

    let getUsers = function(team) {
      return TeamUser.find({
        team: team.id,
        deletedAt: null,
        role: {
          "!": sails.config.guestRoleIndex
        }
      }).then(function(users) {
        let plans = _.pluck(users, 'plan');
        planCount = _.countBy(plans, function(num) {
          return num;
        });
        return users;
      })
    };

    let countSubscriptions = function(users) {
      let promises = [];
      Object.keys(planCount).forEach(function(key) {
        let promise = Plan.findOne({
          id: key
        }).then(function(plan) {
          return subscribePlan(plan, planCount[key]);
        })
        promises.push(promise);
      })
      return Promise.all(promises);
    };

    let validateCoupon = function(users) {
      return new Promise(function(resolve, reject) {
        if (req.body.couponCode) {
          return Subscription.validateCoupon(req.body.couponCode).then(function(coupon) {
            if (!coupon.valid) {
              reject("Coupon is invalid")
            } else {
              resolve(users)
            }
          })
        } else {
          resolve(users)
        }
      });
    };

    let subscribePlan = function(plan, quantity) {
      return Customer.listPlans({
        query: "code:" + plan.code
      }).then(function(availablePlans) {
        let frequencys = _.pluck(availablePlans[0].planFrequencies, 'interval');
        //Default Monthly frequency
        let index = _.indexOf(frequencys, "Monthly");
        let subscription = {
          customerId: team.billingId,
          code: plan.code,
          name: plan.name,
          planFrequencyId: availablePlans[0].planFrequencies[index].id
        };
        return Subscription.create(subscription).then(function(subscription) {
          subscription.subscriptionProducts[0].quantity = quantity;
          if (req.body.couponCode) {
            return Subscription.updateSubscription(subscription).then(function(subscription) {
              return Subscription.applyCoupon(subscription.id, req.body.couponCode).then(function(coupon) {
                return Subscription.activate(subscription.id, true, false).then(function(subscription) {
                  Subscription.destroy(subscription.id)
                  return subscription;
                })
              });
            });
          } else {
            return Subscription.updateSubscription(subscription).then(function(subscription) {
              return Subscription.activate(subscription.id, true, false).then(function(subscription) {
                Subscription.destroy(subscription.id)
                return subscription;
              })
            });
          }
        });
      });
    };

    transformRequest
      .then(validate)
      .then(getTeam)
      .then(validateCoupon)
      .then(getUsers)
      .then(countSubscriptions)
      .then(TransformerService.customer.sendSubscription)
      .then(res.created)
      .catch(res.generalError);

  },

  /**
   * @api {get} /team/:id.wallet
   * @apiVersion 2.3.15
   * @apiName GetTeamWallet
   * @apiGroup Team
   *
   * @apiDescription Gets the details of a specific team.
   * @apiParam id The team's id.
   * @apiUse populate
   *
   * @apiParam (Populate) [users]
   * @apiParam (Populate) [departments]
   *
   * @apiSuccess {Team} body the team object
   *
   * @apiUse minimalTeam
   * @apiUse fullTeam
   * @apiUse apiObjectDefaults
   *
   * @apiUse minimalUser
   * @apiUse minimalChat
   * @apiUse minimalDepartment
   */
  getWallet: function(req, res) {
    let transformRequest = TransformerService.team.get(req);
    let filterTeamWallet = function() {
      return TeamWallet.findOne({
        team: req.param('id')
      });
    };

    transformRequest
      .then(filterTeamWallet)
      .then(TransformerService.team.sendWallet)
      .then(res.okOrNotFound)
      .catch(res.serverError);
  },

  /**
   * @api {patch} /team/:id/wallet
   * @apiVersion 2.3.15
   * @apiName UpdateTeamWallet
   * @apiGroup Team
   *
   * @apiDescription updates a team's wallet settings
   * @apiParam id The team's id.
   * @apiParam (body) {TeamWallet} body any changed fields from the team object
   * @apiUse minimalTeam
   */

  updateWallet: function(req, res) {

    let transformRequest = TransformerService.team.getWallet(req);
    let teamObj = null;
    let amount = null;

    let getWallet = function() {
      return TeamWallet.findOne({
        team: req.param('id')
      })
    }

    let updateTeamWallet = function(wallet) {
      return TeamWallet.update({
        id: wallet.id
      }, req.body);
    };

    let autoRefill = function(wallets) {
      let wallet = wallets[0];
      if (wallet.auto_refill) {
        return TeamCredit.findOne({
          team: wallet.team
        }).then(function(teamCredit) {
          if (teamCredit.amount < wallet.refill_point) {
            amount = (wallet.refill_point + wallet.refill_amount) - teamCredit.amount;
            return buyCredits(teamCredit.team).then(addFunds).then(function(result) {
              return wallet;
            })
          } else {
            return wallet;
          }
        });
      } else {
        return wallet;
      }
    };

    let buyCredits = function(id) {
      return Team.findOne({
        id: id
      }).then(function(team) {
        teamObj = team;
        return Customer.listProducts({
          query: "code:" + sails.config.billing.walletCode
        }).then(function(products) {
          if (products.length > 0) {
            return Customer.purchase({
              customerId: team.billingId,
              productId: products[0].id,
              quantity: amount,
              name: products[0].name
            }).then(function(purchase) {
              if (purchase) {
                return Customer.finalizePurchase({
                  customerId: team.billingId,
                  purchaseIds: [purchase.id]
                })
              }
            })
          }
        });
      }).catch(function(err) {
        console.log('err', err);
      });
    };

    let addFunds = function(purchase) {
      if (purchase) {
        return TeamCredit.findOne({
          team: teamObj.id
        }).then(function(teamCredit) {
          teamCredit.amount += amount;
          return TeamCredit.update({
            id: teamCredit.id
          }, {
            amount: teamCredit.amount
          })
        }).catch(function(err) {
          console.log('err', err);
        });
      } else {
        return;
      }
    };

    transformRequest
      .then(getWallet)
      .then(updateTeamWallet)
      .then(autoRefill)
      .then(TransformerService.team.sendWallet)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /team/:id/cancelsubscription
   * @apiVersion 2.3.15
   * @apiName cancelSubscription
   * @apiGroup Team
   *
   * @apiDescription sends an email to support@debrief to contact the user about canceling the team subscription
   * @apiParam id The team's id.t
   * @apiUse minimalTeam
   */

  cancelSubscription: function(req, res) {

    let transformRequest = TransformerService.team.get(req);
    let teamUser = {};


    let getUserInfo = function() {
      return TeamUser.findOne({
        team: req.param('id'),
        user: req.user
      })
    }

    let getTeamInfo = function(user) {
      teamUser = user;
      return Team.findOne({
        id: req.param('id')
      })
    }

    let sendEmail = function(team) {
      return Team.sendCancellationEmail("Cancellation", teamUser, team);
    };

    transformRequest
      .then(getUserInfo)
      .then(getTeamInfo)
      .then(sendEmail)
      .then(TransformerService.team.sendWallet)
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },

  /**
   * @api {patch} /affiliate/:ref/visit
   * @apiVersion 2.3.15
   * @apiName createVisit
   * @apiGroup Team
   *
   * @apiDescription creates a visit for affiliate program
   * @apiParam ref The affiliate ID
   * @apiUse minimalTeam
   */

  createVisit: function(req, res) {
    let ip = req.ip;
    let transformRequest = TransformerService.team.getVisit(req);

    let createVisit = function() {
      if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
      }
      return Affiliate.createVisit({
        ref: req.param("ref"),
        ip: ip,
        url: req.param("url")
      }).then(function(result) {
        return result;
      })
    };

    return transformRequest
      .then(createVisit)
      .then(res.okOrNotFound)
      .catch(res.generalError);

  },

  /**
   * @api {get} /team/:id/pickupGroup
   * @apiVersion 2.3.15
   * @apiName GetPickupGroup
   * @apiGroup Team
   *
   * @apiDescription get the pickup groups
   * @apiParam id the team's id
   * @apiUse queryParams
   * @apiUse populate
   *
   *
   * @apiSuccess pickupGroups
   */
  findPickupGroups: function(req, res) {
    TransformerService.team.get(req)
      .then(function() {
        return Team.findOne({
            id: req.param('id')
          })
          .then(function(team) {
            return JSON.parse(team.pickupGroups);
          });
      })
      .then(res.okOrNoContent)
      .catch(res.serverError);
  },

  /**
   * @api {patch} /team/:id/pickupgroups
   * @apiVersion 2.3.15
   * @apiName Create/Update pickupgroups
   * @apiGroup Team
   *
   * @apiDescription Update pickup groups
   *
   * @apiParam {integer} id the Team id
   * @apiParam (Body) {json} [pickupGroups] The pickup groups of the team
   */
  updatePickupGroups: function(req, res) {
    TransformerService.team.get(req.body)
      .then(function() {
        return Team.update({
          id: Team.pidToIdSync(req.param('id'))
        }, {
          pickupGroups: JSON.stringify(req.body.pickupGroups)
        });
      })
      .then(res.okOrNotFound)
      .catch(res.generalError);
  },
};