'use strict';

var calendar = require('../transformers/CalendarTransformer');
var chatMessage = require('../transformers/ChatMessageTransformer');
var creditcards = require('../transformers/CreditCardTransformer');
var chat = require('../transformers/ChatTransformer');
var chatUser = require('../transformers/ChatUserTransformer');
var guest = require('../transformers/GuestTransformer');
var contact = require('../transformers/ContactTransformer');
var conference = require("../transformers/ConferenceTransformer");
var dashboard = require('../transformers/DashboardTransformer');
var department = require('../transformers/DepartmentTransformer');
var integration = require('../transformers/IntegrationTransformer');
var intercom = require('../transformers/IntercomTransformer');
var team = require('../transformers/TeamTransformer');
var teamUser = require('../transformers/TeamUserTransformer');
var userDevice = require('../transformers/UserDeviceTransformer');
var user = require('../transformers/UserTransformer');
var event = require('../transformers/EventTransformer');
var search = require('../transformers/SearchTransformer');
var teaminvite = require('../transformers/TeamInviteTransformer');
var files = require('../transformers/FileTransformer');
var filebackup = require('../transformers/FileBackupTransformer');
var links = require('../transformers/LinkTransformer');
var plan = require('../transformers/PlanTransformer');
var callroute = require('../transformers/CallRouteTransformer');
var calllog = require('../transformers/CallLogTransformer');
var didnumber = require('../transformers/DidNumberTransformer');
var guest = require('../transformers/GuestTransformer');
var channel = require('../transformers/ChannelTransformer');
var channelevent = require('../transformers/ChannelEventTransformer');
var charge = require('../transformers/ChargeTransformer');
var country = require('../transformers/CountryTransformer');
var currency = require('../transformers/CurrencyTransformer');
var voicemail = require('../transformers/VoicemailTransformer');
var customer = require('../transformers/CustomerTransformer');
var voicemailPrefs = require('../transformers/VoicemailPrefsTransformer');
var language = require('../transformers/LanguageTransformer');
var locale = require('../transformers/LocaleTransformer');

module.exports = {
  calendar: calendar,
  chatmessage: chatMessage,
  creditcards: creditcards,
  chat: chat,
  chatuser: chatUser,
  channel: channel,
  channelevent: channelevent,
  charge: charge,
  conference: conference,
  contact: contact,
  dashboard: dashboard,
  department: department,
  didnumber: didnumber,
  integration: integration,
  intercom: intercom,
  team: team,
  teamuser: teamUser,
  userdevice: userDevice,
  user: user,
  search: search,
  event: event,
  teaminvite: teaminvite,
  files: files,
  filebackup: filebackup,
  links: links,
  plan: plan,
  guest: guest,
  callroute: callroute,
  calllog: calllog,
  country: country,
  currency: currency,
  voicemail: voicemail,
  customer: customer,
  voicemailPrefs: voicemailPrefs,
  language: language,
  locale: locale,
};