/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  '*': ['tokenAuth'],
  
  'LocaleController': {
    'find': true,
    'findOne': true
  },
  'LanguageController': {
    'find': true,
    'findOne': true
  },
  'UserController': {
    'create': true,
    'exist': true
  },
  'TeamController': {
    'find': ['tokenAuth', 'superAdmin'],
    'create': true,
    'exist': true,
    'getTeamInfo': true,
    'createVisit': true
  },
  'TeamUserController': {
    'editTeamUser': ['tokenAuth', 'SameUserOrAdmin'],
    'destroy': ['tokenAuth', 'isAdmin']
  },
  'PlanController': {
    'find': true,
    'findOne': true
  },
  'ChatController': {
    'find': ['tokenAuth', 'InTeam'],
    'findOne': ['tokenAuth', 'InChat'],
    'findDepartments': ['tokenAuth', 'InTeam'],
    'findRooms': ['tokenAuth', 'InTeam', 'isAdmin']
  },
  'ChatMessageController': {
    'findMessages': ['tokenAuth', 'InChat'],
    'addMessage': ['tokenAuth', 'InChat']
  },
  'DepartmentController': {
    'find': ['tokenAuth', 'InTeam', 'IsAdmin']
  },
  'GuestController' : {
    'join' : true
  },
  'TeamInviteController': {
    'accept': true
  },
  'FileController': {
    'find': ['tokenAuth', 'IsTeam', 'InTeam'],
    'download': true
  },
  'PlanController': {
    'update': ['tokenAuth', 'superAdmin'],
    'create': ['tokenAuth', 'superAdmin']
  },
  'CurrencyController': {
    'find': ['tokenAuth', 'superAdmin'],
    'findOne': ['tokenAuth', 'superAdmin'],
    'update': ['tokenAuth', 'superAdmin'],
    'create': ['tokenAuth', 'superAdmin']
  },
  'CreditCardController': {
    'getCountries': true
  }


  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
