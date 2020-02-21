/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  /*******************************************************************************
   * Routes are stored in ALPHABETICAL ORDER ease of finding them (and sanity!)  *
   *******************************************************************************/

  /**
   * Autoreception
   */
  'get /didnumber': 'DidNumberController.find',
  'delete /didnumber/:id': 'DidNumberController.destroy',
  'get /didnumber/countries': 'DidNumberController.listCountries',
  'get /didnumber/:country/states': 'DidNumberController.listStates',
  'get /didnumber/:country/cities': 'DidNumberController.listCities',
  'post /team/:id/autoreception': 'DidNumberController.createAutoreception',

   /**
   * Affiliate Marketing
   */
  'post /affiliate/:ref/visit': 'TeamController.createVisit',

  /**
   * Call Logs
   */
  'get /call-log': 'CallLogController.find',
  'post /call-log': 'CallLogController.create',

  /**
   * Call Routes
   */
  'get /call-route': 'CallRouteController.find',
  'get /call-route/:id': 'CallRouteController.findOne',
  'post /call-route': 'CallRouteController.create',
  'patch /call-route/:id': 'CallRouteController.edit',
  'delete /call-route/:id': 'CallRouteController.delete',

  /**
   * Chat
   */

  'get /chat': 'ChatController.find',
  'get /chat/:id': 'ChatController.findOne',
  'post /chat': 'ChatController.create',
  'patch /chat/:id': 'ChatController.update',
  'delete /chat/:id': 'ChatController.destroy',
  'get /chat/:id/generateurl': 'ChatController.generateUrl',
  'get /team/:team/rooms': 'ChatController.findRooms',
  'get /team/:team/departments': 'ChatController.findDepartments',
  'get /chat/:roomNumber/conference': 'ChatController.findChatByRoomNumber',

  /**
   * Chat Messages
   */

  'get /chat/messages/unread': 'ChatMessageController.findUnread',
  'get /chat/:chatid/messages': 'ChatMessageController.findMessages',
  'get /chat/:chat/files': 'ChatMessageController.findFiles',
  'get /chat/:chat/links': 'ChatMessageController.findLinks',
  'post /chat/:chatid/messages': 'ChatMessageController.addMessage',
  'patch /chat/:chatid/messages/:messageid': 'ChatMessageController.editMessage',
  'delete /chat/:chatid/messages/:messageid': 'ChatMessageController.deleteMessage',
  'get /chat/:chatid/messages/:messageid/translate': 'ChatMessageController.translateChatMessage',
  'get /chat/:chatid/messages/:messageid/original': 'ChatMessageController.originalChatMessage',
  'post /chat/transcriptionmessage': 'ChatMessageController.addTranscriptionMessage',

  /**
   * Chat Users
   */

  'get /chat/:chatid/users': 'ChatUserController.findUsers',
  'post /chat/:chatid/users': 'ChatUserController.addUsers',
  'patch /chat/:chatid/users/:userid': 'ChatUserController.editUser',
  'delete /chat/:chatid/users/:userid': 'ChatUserController.removeUser',
  'post /chat/:chatid/seen': 'ChatUserController.markLastSeen',

  /**
   * Channels
   */
  'get /channel': 'ChannelController.find',
  'post /channel': 'ChannelController.create',
  'patch /channel/:id': 'ChannelController.update',

  /**
   * Channel Events
   */
  'get /channel_event': 'ChannelEventController.find',
  'get /channel/:channel/events': 'ChannelEventController.find',
  'post /channel_event': 'ChannelEventController.create',

  /**
   * Charge
   */
  'post /charge': 'ChargeController.charge',
  'get /team/:id/credits': 'ChargeController.getCredits',

  /**
   * Conferences
   */
  'get /conference/:id': 'ConferenceController.findOne',
  'post /conference/:id/kick/:conf_usr_id': 'ConferenceController.kick',
  'post /conference/:id/floor/:conf_usr_id': 'ConferenceController.floor',
  'post /conference/:id/video-floor/:conf_usr_id': 'ConferenceController.vidfloor',
  'post /conference/:id/video': 'ConferenceController.setVideoState',
  'post /conference/:id/mute/:conf_usr_id': 'ConferenceController.mute',
  'post /conference/:id/unmute/:conf_usr_id': 'ConferenceController.unmute',
  'post /conference/:id/start-recording': 'ConferenceController.start_recording',
  'post /conference/:id/stop-recording': 'ConferenceController.stop_recording',
  'post /conference/:id/leave': 'ConferenceController.leave',
  'post /conference/:id/fs_event': 'ConferenceController.fs_event',
  'post /conference/:id': 'ConferenceController.create_conference',
  'delete /conference/:id': 'ConferenceController.delete_conference',

  /**
   * Contacts
   */
  'get /contact': 'ContactController.find',
  'get /contact/:id': 'ContactController.findOne',
  'post /contact': 'ContactController.create',
  'patch /contact/:id': 'ContactController.update',
  'delete /contact/:id': 'ContactController.destroy',
  'get /integration/:integration/contacts': 'ContactController.findRemoteContacts',
  'get /integration/:integration/contacts/:remoteid': 'ContactController.findRemoteContact',

  /**
  * Countries
  */

  'get /country': 'CountryController.find',

  /**
   * Credit Cards
   */
  'get /credit-card/:id': 'CreditCardController.findOne',
  'patch /credit-card/:id': 'CreditCardController.update',
  'delete /credit-card/:id': 'CreditCardController.destroy',

  /**
   * Currency
   */
  'get /currency': 'CurrencyController.find',
  'get /currency/:id': 'CurrencyController.findOne',
  'patch /currency/:id': 'CurrencyController.update',
  'post /currency': 'CurrencyController.create',

  /**
   * Dashboard
   */
   'get /dashboard/:team/main': 'DashboardController.main',
   'get /dashboard/:team/notifications': 'DashboardController.notifications',
   'get /timeline/:team': 'DashboardController.getTimeline',
   'get /notifications/:team': 'DashboardController.getNotifications',
   'patch /notifications': 'DashboardController.setRead',
   'delete /notifications/:id': 'DashboardController.deleteNotification',

  /**
   * Departments
   */
  'get /department': 'DepartmentController.find',
  'get /department/:id': 'DepartmentController.findOne',
  'post /department': 'DepartmentController.create',
  'patch /department/:id': 'DepartmentController.update',
  'delete /department/:id': 'DepartmentController.destroy',
  'get /department/:id/user': 'DepartmentController.users',
  'get /department/:id/user/:id': 'DepartmentController.user',
  'get /did-number/find/:number': 'DidNumberController.findOneByNumber',

  /**
   * Events
   */
  'get /integration/:integration/event': 'EventController.find',
  'get /integration/:integration/event/:id': 'EventController.findOne',
  'post /integration/:integration/event': 'EventController.create',
  'patch /integration/:integration/event/:id': 'EventController.update',
  'delete /integration/:integration/event/:id': 'EventController.destroy',
  'delete /integration/:integration/event/:id/user/:email': 'EventController.removeGuests',
  'post /integration/:integration/event/:id/user': 'EventController.addGuests',

  /**
   * Files
   */
  'get /file': 'FileController.find',
  'get /file/:id': 'FileController.findOne',
  'post /file': 'FileController.create',
  'patch /file/:id': 'FileController.update',
  'delete /file/:id': 'FileController.destroy',
  'get /files-links/:team': 'FileController.findLinksAndFiles',
  'get /download/:url': 'FileController.download',
  'post /file/:id/resendFile': 'FileController.resendFile',

  /**
   * File Backup
   */
  'get /backup-url': 'FileBackupController.getUrl',
  'post /check-backup-token': 'FileBackupController.checkFileToken',
  'post /update-usage': 'FileBackupController.updateUsage',
  'post /backup': 'FileBackupController.backup',
  'get /restore': 'FileBackupController.restore',

  /**
   * Guest
   */
  'post /guest/invite': 'GuestController.invite',
  'post /guest/join': 'GuestController.join',
  'post /guest/block': 'GuestController.block',
  'delete /guest/:id' : 'GuestController.remove',

  /**
   * Integrations
   */
  'get /integration': 'IntegrationController.find',
  'get /integration/:id': 'IntegrationController.findOne',
  'post /integration': 'IntegrationController.create',
  'patch /integration/:id': 'IntegrationController.update',
  'delete /integration/:id': 'IntegrationController.destroy',

  /**
   * Intercom
   */
  'post /intercom': 'IntercomController.createHash',

  /**
   * Links
   */
  'get /link': 'LinkController.find',

  /**
   * Notes
   */
  'get /user/:id/note': 'NoteController.findOne',
  'post /note': 'NoteController.create',
  'patch /note/:id': 'NoteController.update',
  'delete /note/:id': 'NoteController.destroy',

  /**
   * Plans
   */
  'get /plan': 'PlanController.find',
  'get /plan/:id': 'PlanController.findOne',
  'patch /plan/:id': 'PlanController.update',
  'post /plan': 'PlanController.create',

  /**
   * Search
   */
  'get /search/:team/:term': 'SearchController.search',
  'get /search/:team/users/:term': 'SearchController.searchUsers',
  'get /search/:team/chats/:term': 'SearchController.searchChats',
  'get /search/:team/messages/:term': 'SearchController.searchMessages',
  'get /search/:team/files/:term': 'SearchController.searchFiles',
  'get /search/chat/:chatid/:term': 'SearchController.searchInChat',
  'get /search/:team/keypad/:term': 'SearchController.keypadSearch',

  /**
   * Sockets
   */
  'post /socket/register': 'SocketController.register',
  'post /socket/unregister': 'SocketController.unregister',

  /**
   * Teams
   */

  'get /team': 'TeamController.find',
  'post /team': 'TeamController.create',
  'post /team/exist': 'TeamController.exist',
  'get /team/:id': 'TeamController.findOne',
  'patch /team/:id':'TeamController.update',
  'delete /team/:id': 'TeamController.destroy',
  'get /team/:id/info': 'TeamController.getTeamInfo',
  'get /team/:id/status': 'TeamController.checkTeamStatus',
  'get /team/:id/pickupgroups': 'TeamController.findPickupGroups',
  'post /team/:id/pickupgroups': 'TeamController.updatePickupGroups',

  /*
   * Team Billing
   */
  'get  /team/:id/credit-card': 'CreditCardController.find',
  'get  /countries': 'CreditCardController.getCountries',
  'get  /team/:id/transactions': 'Customer.getTransactions',
  'get  /team/:id/invoices': 'Customer.getInvoices',
  'get  /invoicepdf/:id': 'Customer.getInvoicePDF',
  'get  /draftinvoicepdf/:id': 'Customer.getDraftInvoicePDF',
  'post /team/:id/customer': 'TeamController.customer',
  'post /team/:id/subscribe': 'TeamController.subscribe',
  'patch /credit-card/:id/setDefault': 'CreditCardController.setDefault',
  'get /team/:id/overview': 'Customer.getOverview',
  'get /team/:id/subscriptions': 'Customer.listSubscriptions',
  'post /team/:id/addfunds': 'Customer.addFunds',
  'get  /team/:id/wallet': 'TeamController.getWallet',
  'patch /team/:id/wallet': 'TeamController.updateWallet',
  'post /team/:id/cancelsubscription': 'TeamController.cancelSubscription',
  'post /team/:id/previewsubscribe': 'TeamController.previewSubscribe',
  'patch /team/:id/billingaddress': 'Customer.updateAddress',

  /**
   * Team DID Number
   */
  'get /team/:id/did-number': 'DidNumberController.find',
  'get /team/:id/did-number/:id': 'DidNumberController.findOne',
  'post /team/:id/did-number': 'DidNumberController.create',
  'patch /team/:id/did-number/:id': 'DidNumberController.edit',
  'delete /team/:id/did-number/:id': 'DidNumberController.destroy',
  'get /didnumber/globalnumbers': 'DidNumberController.getGlobalConferenceNumbers',
  'get /didnumber/prices': 'DidNumberController.listNumberPrices',
  'post /team/:id/buynumber': 'DidNumberController.buyNumber',

  'get /team/:id/users': 'TeamUserController.find',
  'get /team/:teamid/users/:userid': 'TeamUserController.findOne',
  'post /team/:id/invite': 'TeamInviteController.invite',
  'post /team/:id/add': 'TeamUserController.add',
  'delete /team/:id/users/:userid': 'TeamUserController.remove',
  'patch /team/:id/users/:userid/restore': 'TeamUserController.restore',
  'post /team/:id/accept': 'TeamInviteController.accept',
  'patch /team/:teamid/users/:userid': 'TeamUserController.editTeamUser',
  'post /team/:id/resendInvite': 'TeamInviteController.resendInvite',
  'get /team/:id/pendingusers': 'TeamUserController.findPending',

  /**
   * Users
   */
  'get /user': 'UserController.find',
  'get /user/me': 'UserController.me',
  'get /user/:id': 'UserController.findOne',
  'post /user': 'UserController.create',
  'post /user/exist': 'UserController.exist',
  'patch /user/:id': 'UserController.update',
  'delete /user/:id': 'UserController.destroy',

  /**
   * User Devices
   */
  'post /user/:id/devices': 'UserDeviceController.createDevice',
  'post /user/:id/devices/notification': 'UserDeviceController.sendNotification',
  'patch /user/:id/devices/:registration_id': 'UserDeviceController.updateDevice',
  'delete /user/:id/devices/:registration_id': 'UserDeviceController.destroyDevice',

  /**
   * Voicemail
   */
  'get /voicemail': 'VoicemailController.find',
  'get /voicemail/settings': 'VoicemailController.getSettings',
  'get /voicemail/:id': 'VoicemailController.findOne',
  'post /voicemail': 'VoicemailController.create',
  'post /voicemail/:id/user/:uid': 'VoicemailController.forward',
  'patch /voicemail/:id': 'VoicemailController.update',
  'patch /voicemail/settings/greeting': 'VoicemailController.setGreeting',
  'patch /voicemail/settings/password': 'VoicemailController.setPassword',
  'delete /voicemail/:id': 'VoicemailController.destroy',
  
  /**
   * Localization
   */
   'get /locale': 'LocaleController.find',
   'get /locale/:id': 'LocaleController.findOne',
   'get /language/:id': 'LanguageController.findOne',
   'patch /language/:id': 'LanguageController.update',
   'post /locale': 'LocaleController.create',
   'patch /locale/:id': 'LocaleController.update',
   'delete /locale/:id': 'LocaleController.destroy'
};

