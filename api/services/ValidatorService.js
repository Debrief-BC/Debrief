'use strict';

var calendar = require('../validators/CalendarValidator');
var chatMessage = require('../validators/ChatMessageValidator');
var chat = require('../validators/ChatValidator');
var chatUser = require('../validators/ChatUserValidator');
var guest = require('../validators/GuestValidator');
var contact = require('../validators/ContactValidator');
var department = require('../validators/DepartmentValidator');
var integration = require('../validators/IntegrationValidator');
var intercom = require('../validators/IntercomValidator');
var team = require('../validators/TeamValidator');
var teamUser = require('../validators/TeamUserValidator');
var userDevice = require('../validators/UserDeviceValidator');
var user = require('../validators/UserValidator');
var teaminvite = require('../validators/TeamInviteValidator');
var callroute = require('../validators/CallRouteValidator');
var calllog = require('../validators/CallLogValidator');
var didnumber = require('../validators/DidNumberValidator');
var event = require('../validators/EventValidator');
var files = require('../validators/FilesValidator');
var filebackup = require('../validators/FileBackupValidator');
var note = require('../validators/NoteValidator');
var channel = require('../validators/ChannelValidator');
var channelevent = require('../validators/ChannelEventValidator');
var charge = require('../validators/ChargeValidator');
var voicemail = require('../validators/VoicemailValidator');
var voicemailPrefs = require('../validators/VoicemailPrefsValidator');
var language = require('../validators/LanguageValidator');
var locale = require('../validators/LocaleValidator');

module.exports = {
  calendar: calendar,
  chatmessage: chatMessage,
  chat: chat,
  chatuser: chatUser,
  channel: channel,
  channelevent: channelevent,
  charge: charge,
  guest: guest,
  contact: contact,
  department: department,
  didnumber: didnumber,
  integration: integration,
  intercom: intercom,
  team: team,
  teamuser: teamUser,
  userdevice: userDevice,
  user: user,
  teaminvite: teaminvite,
  callroute: callroute,
  calllog: calllog,
  event: event,
  files: files,
  filebackup: filebackup,
  voicemail: voicemail,
  voicemailPrefs: voicemailPrefs,
  language: language,
  locale: locale,
};