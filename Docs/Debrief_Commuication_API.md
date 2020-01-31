
# Debrief Communication API

The Debrief platform is designed as a high-availability REST API available either with traditional HTTP request/responses, or through a persistent Socket connection through the sails.io client.In addition to reducing connection overhead, socket connections can also receive events for things like chat messages, members changing their name, status, or avatar. Any real-time application can benefit from the flexibility of using either long-polling or socket connections wherever is needed.

## Indices

* [Authentication](#authentication)

  * [/login-user - Login](#1-login-user---login)
  * [/forgot-password - Start password reset](#2-forgot-password---start-password-reset)
  * [/reset-password - Password reset](#3-reset-password---password-reset)
  * [/change-password - Change password](#4-change-password---change-password)
  * [/logout-user - Logout](#5-logout-user---logout)
  * [/client - Generate client credentials](#6-client---generate-client-credentials)

* [Workspace](#workspace)

  * [/team/:team_id/workspace - Get workspace event list](#1-team:team_idworkspace---get-workspace-event-list)
  * [/team/:team_id/workspace/:id - Delete workspace event](#2-team:team_idworkspace:id---delete-workspace-event)
  * [/team/:team_id/workspace/:id - Mark workspace as read](#3-team:team_idworkspace:id---mark-workspace-as-read)

* [Misc](#misc)

  * [socket/register - Register socket](#1-socketregister---register-socket)
  * [socket/unregister - Unregister socket](#2-socketunregister---unregister-socket)
  * [/plan - List all plans](#3-plan---list-all-plans)
  * [/country - List all countries](#4-country---list-all-countries)

* [Search](#search)

  * [/search/:team_id/:search_term - Search all](#1-search:team_id:search_term---search-all)
  * [/search/:team_id/chats/:search_term - Search for chat](#2-search:team_idchats:search_term---search-for-chat)
  * [/search/chat/:chat_id/:search_term - Search for message in Chat](#3-searchchat:chat_id:search_term---search-for-message-in-chat)
  * [/search/:team_id/users/:search_term - Search for user](#4-search:team_idusers:search_term---search-for-user)
  * [/search/:team_id/messages/:search_term - Search for message](#5-search:team_idmessages:search_term---search-for-message)
  * [/search/:team_id/files/:search_term - Search for File](#6-search:team_idfiles:search_term---search-for-file)
  * [/search/:team_id/workspace/:search_term - Search for Workspace event](#7-search:team_idworkspace:search_term---search-for-workspace-event)

* [Calls/Call Queues/Queues](#callscall-queuesqueues)

  * [/CCQueueConfig - Create Call Queue](#1-ccqueueconfig---create-call-queue)
  * [/CCQueueConfig/:queue_id - Get Queue](#2-ccqueueconfig:queue_id---get-queue)
  * [/team/:team_id/ccqueueconfig - Get all team Queues](#3-team:team_idccqueueconfig---get-all-team-queues)
  * [/CCQueueConfig/:queue_id - Update Queue](#4-ccqueueconfig:queue_id---update-queue)
  * [/CCQueueConfig/:team_id - Delete Queue](#5-ccqueueconfig:team_id---delete-queue)
  * [/CCQueueConfig/:queue_id/agent/:agent_id - Add Agent to Queue](#6-ccqueueconfig:queue_idagent:agent_id---add-agent-to-queue)
  * [/CCQueueConfig/:queue_id/agent/:agent_id - Remove Agent from Queue](#7-ccqueueconfig:queue_idagent:agent_id---remove-agent-from-queue)

* [Calls/Call Queues/Agents](#callscall-queuesagents)

  * [/CCAgentConfig - Create agent](#1-ccagentconfig---create-agent)
  * [/CCAgentConfig/:agent_id/setstatus - Set Agent status](#2-ccagentconfig:agent_idsetstatus---set-agent-status)
  * [/CCAgentConfig/:agent_id/live - Get Agent's live queue](#3-ccagentconfig:agent_idlive---get-agent's-live-queue)
  * [/CCAgentConfig/:agent_id - Get Agent](#4-ccagentconfig:agent_id---get-agent)
  * [/TeamUser/:user_id/CCAgentConfig  - Get all team Agents](#5-teamuser:user_idccagentconfig----get-all-team-agents)
  * [/CCAgentConfig/:agent_id - Update agent](#6-ccagentconfig:agent_id---update-agent)
  * [/CCAgentConfig/:agent_id - Delete agent](#7-ccagentconfig:agent_id---delete-agent)

* [Calls/DID / Phone Numbers](#callsdid--phone-numbers)

  * [/didnumber - List all numbers](#1-didnumber---list-all-numbers)
  * [/didnumber - Create DID number](#2-didnumber---create-did-number)
  * [/didnumber/:id - Get DID number](#3-didnumber:id---get-did-number)
  * [/didnumber/:id - Update DID number](#4-didnumber:id---update-did-number)

* [Calls/Call Routing](#callscall-routing)

  * [/callroute - Create call route](#1-callroute---create-call-route)
  * [/callroute/:id - Delete call route](#2-callroute:id---delete-call-route)
  * [/callroute/:id - Edit call route](#3-callroute:id---edit-call-route)
  * [/callroute/:id - Get call route](#4-callroute:id---get-call-route)
  * [/callroute - List all call routes](#5-callroute---list-all-call-routes)

* [Calls/Voicemail](#callsvoicemail)

  * [/voicemail - List voicemails](#1-voicemail---list-voicemails)

* [Calls/Call Logs](#callscall-logs)

  * [/call-log - Get list of call logs](#1-call-log---get-list-of-call-logs)

* [Integrations/Event](#integrationsevent)

  * [/integration/:integration_id/event - Create event](#1-integration:integration_idevent---create-event)
  * [/integration/:integration_id/event - Get event list](#2-integration:integration_idevent---get-event-list)
  * [/integration/:integration_id/event/:event_id - Delete event](#3-integration:integration_idevent:event_id---delete-event)
  * [/integration/:integration_id/event/:event_id - Update event](#4-integration:integration_idevent:event_id---update-event)
  * [/integration/:integration_id/event/:event_id/user - Add guest to event](#5-integration:integration_idevent:event_iduser---add-guest-to-event)
  * [/integration/:integration_id/event/:event_id/user/:email - Remove guest from event](#6-integration:integration_idevent:event_iduser:email---remove-guest-from-event)

* [Integrations/Contacts](#integrationscontacts)

  * [/contact - Create contact](#1-contact---create-contact)
  * [/contact - Get contact list](#2-contact---get-contact-list)
  * [/contact/:id - Get contact](#3-contact:id---get-contact)
  * [/contact/:id - Update contact](#4-contact:id---update-contact)
  * [/contact/:id - Delete contact](#5-contact:id---delete-contact)
  * [/integration/:integration_id/contacts - Get integration contact list](#6-integration:integration_idcontacts---get-integration-contact-list)
  * [/integration/:integration_id/contacts/:id - Get integration contact](#7-integration:integration_idcontacts:id---get-integration-contact)

* [Integrations/General](#integrationsgeneral)

  * [/integration - Create integration](#1-integration---create-integration)
  * [/integration/:id - Get integration](#2-integration:id---get-integration)
  * [/integration - List all integrations](#3-integration---list-all-integrations)
  * [/integration/:id - Update integration](#4-integration:id---update-integration)
  * [/integration/:id - Delete integration](#5-integration:id---delete-integration)

* [Chats/Files](#chatsfiles)

  * [/chat/:id/files - Get chat files](#1-chat:idfiles---get-chat-files)
  * [/file - List all files](#2-file---list-all-files)
  * [/file/:id - Get file](#3-file:id---get-file)
  * [/file/:id - Update file](#4-file:id---update-file)
  * [/file - Upload file](#5-file---upload-file)

* [Chats/Links](#chatslinks)

  * [/chat/:id/links - Get chat links](#1-chat:idlinks---get-chat-links)
  * [/link - Get user links](#2-link---get-user-links)

* [Chats/Messages](#chatsmessages)

  * [/chat/:id/messages - Get chat messages](#1-chat:idmessages---get-chat-messages)
  * [/chat/:id/messages - Send chat message](#2-chat:idmessages---send-chat-message)
  * [/chat/:id/messages/:msg_id/thread - Get chat message replies](#3-chat:idmessages:msg_idthread---get-chat-message-replies)
  * [/chat/:id/messages/:msg_id/thread - Send chat message reply](#4-chat:idmessages:msg_idthread---send-chat-message-reply)
  * [/chat/:id/messages/:msg_id/mark - Mark message](#5-chat:idmessages:msg_idmark---mark-message)
  * [/chat/:id/messages/:msg_id/mark - Unmark message](#6-chat:idmessages:msg_idmark---unmark-message)
  * [/chat/:id/messages/:msg_id - Delete chat message](#7-chat:idmessages:msg_id---delete-chat-message)
  * [/chat/:id/messages/:msg_id - Edit chat message](#8-chat:idmessages:msg_id---edit-chat-message)
  * [/chat/:id/messages/:msg_id/forward - Forward chat message](#9-chat:idmessages:msg_idforward---forward-chat-message)
  * [/chat/:id/messages/:msg_id/translate - Translate chat message](#10-chat:idmessages:msg_idtranslate---translate-chat-message)
  * [/chat/messages/unread - Get unread messages](#11-chatmessagesunread---get-unread-messages)

* [Chats/General](#chatsgeneral)

  * [/chat - Create chat](#1-chat---create-chat)
  * [/chat - Get chats](#2-chat---get-chats)
  * [/chat/:id - Get chat](#3-chat:id---get-chat)
  * [/chat/:id - Update chat](#4-chat:id---update-chat)
  * [/chat/:id - Delete chat](#5-chat:id---delete-chat)
  * [/chat/:id/seen - Mark as read](#6-chat:idseen---mark-as-read)
  * [/chat/:id/users - Get chat users](#7-chat:idusers---get-chat-users)
  * [/chat/:id/users - Add user](#8-chat:idusers---add-user)
  * [/chat/:id/typing - Send typing event](#9-chat:idtyping---send-typing-event)
  * [/team/:team/chat/exists - Check if chat exists](#10-team:teamchatexists---check-if-chat-exists)
  * [/chat/:id/users/:user_id - Remove user](#11-chat:idusers:user_id---remove-user)
  * [/chat/:id/users/:user_id - Update chat user](#12-chat:idusers:user_id---update-chat-user)
  * [/chat/:roomNumber/conference - Get conference details](#13-chat:roomnumberconference---get-conference-details)
  * [/chat/:id/generateUrl - Generate Guest URL](#14-chat:idgenerateurl---generate-guest-url)

* [Users & Teams/Guests](#users-&-teamsguests)

  * [/guest/:guest_id - Get guest](#1-guest:guest_id---get-guest)
  * [/guest/invite - Invite guest](#2-guestinvite---invite-guest)
  * [/team/:id/guest/exists - Check if guest exists](#3-team:idguestexists---check-if-guest-exists)
  * [/team/:id/guest - Delete guest](#4-team:idguest---delete-guest)
  * [/guest/join - Join group chat](#5-guestjoin---join-group-chat)
  * [/guest/join/meeting - Join meeting chat](#6-guestjoinmeeting---join-meeting-chat)
  * [/team/:id/guest/:guest_id/upgrade - Upgrade guest to user](#7-team:idguest:guest_idupgrade---upgrade-guest-to-user)

* [Users & Teams/Departments](#users-&-teamsdepartments)

  * [/department - Create department](#1-department---create-department)
  * [/department/:dept_id - Update department](#2-department:dept_id---update-department)
  * [/department - List departments](#3-department---list-departments)
  * [/department/:dept_id - Delete department](#4-department:dept_id---delete-department)
  * [/department/:dept_id/users - Add user to Department](#5-department:dept_idusers---add-user-to-department)
  * [/department/:dept_id/users/:id - Remove user from Department](#6-department:dept_idusers:id---remove-user-from-department)

* [Users & Teams/Devices](#users-&-teamsdevices)

  * [/user/:user_id/devices - Register device for push](#1-user:user_iddevices---register-device-for-push)
  * [/user/:user_id/devices/:registration_id - Remove device registration](#2-user:user_iddevices:registration_id---remove-device-registration)
  * [/user/:user_id/devices/:registration_id - Update device registration](#3-user:user_iddevices:registration_id---update-device-registration)

* [Users & Teams/User](#users-&-teamsuser)

  * [/user/me - Get logged-in user profile](#1-userme---get-logged-in-user-profile)
  * [/user/me - Update logged-in user profile](#2-userme---update-logged-in-user-profile)
  * [/user/:user_id - Get user profile](#3-user:user_id---get-user-profile)
  * [/user - Create owner](#4-user---create-owner)
  * [/user/exist - Check if user exists](#5-userexist---check-if-user-exists)
  * [/team/:id/add - Create user](#6-team:idadd---create-user)
  * [/team/:id/invite - Invite user](#7-team:idinvite---invite-user)
  * [/team/:id/accept - Accept invite](#8-team:idaccept---accept-invite)
  * [/team/:id/resendInvite - Resend Invite](#9-team:idresendinvite---resend-invite)
  * [/team/:id/users/:userId - Deactivate user](#10-team:idusers:userid---deactivate-user)
  * [/team/:id/users/:userId - Re-activate user](#11-team:idusers:userid---re-activate-user)
  * [/team/:id/users/:userId - Update User](#12-team:idusers:userid---update-user)
  * [/user - List all users](#13-user---list-all-users)
  * [/team/:id/users/:userId - Update User copy](#14-team:idusers:userid---update-user-copy)

* [Users & Teams/Team](#users-&-teamsteam)

  * [/team - Create team](#1-team---create-team)
  * [/team/:id - Update team info](#2-team:id---update-team-info)
  * [/team/exist - Check existing](#3-teamexist---check-existing)
  * [/team/:id/users - Get team users](#4-team:idusers---get-team-users)
  * [/team/:id/info - Get team info](#5-team:idinfo---get-team-info)
  * [/team/:id/pendingusers - Get team pending users](#6-team:idpendingusers---get-team-pending-users)
  * [/teamuser/:id/ccagentconfig - Get user's CCQueueAgents](#7-teamuser:idccagentconfig---get-user's-ccqueueagents)


--------


## Authentication



### 1. /login-user - Login


Logs in a user by sending their credentials along with the application’s Client credentials. Successful logins will return a access_token and refresh_token. The access token must be sent with future requests as a bearer token. The expires_in field will show the number of seconds the token is valid for, after which the refresh token must be exchanged for a new access token.See the [Authentication](https://developers.debrief.com/authentication) guide for more information about getting and using tokens.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{authBasepath}}/login-user
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "grant_type": "password",  "username": "{{loginUser}}",  "password": "{{loginPassword}}",  "client_id": "{{clientId}}",  "client_secret": "{{clientSecret}}"}
```



### 2. /forgot-password - Start password reset


Initiates a password reset for a user by emailing them a link to a password reset page


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{authBasepath}}/forgot-password
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "email": "someone@example.com"}
```



### 3. /reset-password - Password reset


Completes a password reset by accepting the token emailed to the user, along with a new password.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{authBasepath}}/reset-password
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "email": "someone@example.com"}
```



### 4. /change-password - Change password


Updates the logged-in user's password.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{authBasepath}}/change-password
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "password": "Example1"}
```



### 5. /logout-user - Logout


Logs-out the current user.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{authBasepath}}/logout-user
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 6. /client - Generate client credentials


Creates client credentials for an app


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{authBasepath}}/client
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"name": "your-app"}
```



## Workspace
The Workspace provides read-only access to a user's agregate data for important information like files, pinned messages, and voicemails.



### 1. /team/:team_id/workspace - Get workspace event list


Returns a list of Workspace items for the current user. The Workspace aggregates important events for a User across their entire team. This includes information like files, voicemails, or messages marked as pinned or unread.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/:team_id/workspace
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



### 2. /team/:team_id/workspace/:id - Delete workspace event


Soft-deletes a workspace event. Deleted events won't appear when getting the workspace list without the `deleted` option.


***Endpoint:***

```bash
Method: DELETE
Type: 
URL: {{apiBasepath}}/team/:team_id/workspace/:id
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |
| id |  |  |



### 3. /team/:team_id/workspace/:id - Mark workspace as read


Marks a workspace event as read. Read events won't appear when getting the workspace list without the `read` option.


***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{apiBasepath}}/team/:team_id/workspace
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



## Misc



### 1. socket/register - Register socket


When requesting over a socket connection, this will register the current user to recieve events about objects that they're subscribed to. 


***Endpoint:***

```bash
Method: POST
Type: 
URL: {{apiBasepath}}/socket/register
```



### 2. socket/unregister - Unregister socket


When requesting over a socket connection, this will unregister the current user from recieving events.


***Endpoint:***

```bash
Method: POST
Type: 
URL: {{apiBasepath}}/socket/register
```



### 3. /plan - List all plans


List all available user plans, including pricing information and whether or not that plan is used as default for new users.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/plan
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Responses:***


Status: List all plans | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 415 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:08:53 GMT |
| ETag | W/"19f-+2j7WS9jX4bnvfSM9HgnSA" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[  {    "name": "Pro",    "code": "debriefpro",    "price": "20",    "country": "united states",    "default_plan": true,    "currency": null,    "id": "ab3df0f92b7b953ba99e278ae77537db0"  },  {    "name": "Unlimited",    "code": "debriefunlimited",    "price": "30",    "country": "united states",    "default_plan": false,    "currency": null,    "id": "a00716cfa293f68439b4fe1162ba906da"  }]
```



### 4. /country - List all countries


List all countries.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/country
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| limit | 10 | Number of countries to return |
| skip | 0 | Number of countries to start from |



***Responses:***


Status: List first 10 countries | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 981 |
| Content-Type | application/json; charset=utf-8 |
| Date | Fri, 11 May 2018 17:08:11 GMT |
| ETag | W/"3d5-fjPxVEgUvKPfyqZuXNI1rQ" |
| Server | nginx/1.13.9 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[  {    "code": "US",    "name": "United States",    "id": "ab3df0f92b7b953ba99e278ae77537db0"  },  {    "code": "CA",    "name": "Canada",    "id": "a00716cfa293f68439b4fe1162ba906da"  },  {    "code": "AF",    "name": "Afghanistan",    "id": "a60a65d4938849eb1f35cd430a7c18252"  },  {    "code": "AL",    "name": "Albania",    "id": "aea93eeef316177ec14b00aaa8f645c42"  },  {    "code": "DZ",    "name": "Algeria",    "id": "a81033bef193e87f8cb4818e9c9d896ab"  },  {    "code": "DS",    "name": "American Samoa",    "id": "aac259c130aaaec31641d525ffbc04e57"  },  {    "code": "AD",    "name": "Andorra",    "id": "af2d9d483148508d7e16cb7ae3f0d8ba7"  },  {    "code": "AO",    "name": "Angola",    "id": "aea46b572241bd0852bec355b1f898454"  },  {    "code": "AI",    "name": "Anguilla",    "id": "a0f2da879f83e90865ac6dd06d99a4bb2"  },  {    "code": "AQ",    "name": "Antarctica",    "id": "a1e5187d4e7925e805a92c5973fc24c68"  }]
```



## Search



### 1. /search/:team_id/:search_term - Search all


Searches for a term


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/a5b63640e8d2af8bb894778fa8fdb6794/
```



### 2. /search/:team_id/chats/:search_term - Search for chat


Finds and returns any chats that match a given search term


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/a5b63640e8d2af8bb894778fa8fdb6794/chats/algos
```



### 3. /search/chat/:chat_id/:search_term - Search for message in Chat


Finds and returns any messages in a given chat that match a search term


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/chat/a5b63640e8d2af8bb894778fa8fdb6794/something
```



### 4. /search/:team_id/users/:search_term - Search for user


Finds and returns any users in a team that match a search term


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/:team_id/users/:searchterm
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |
| searchterm |  |  |



### 5. /search/:team_id/messages/:search_term - Search for message


Finds and returns any messages in a team that match a search term, regardless of the chat they were posted in. To search in a chat, see `GET /search/chat/:chat_id/:search_term`.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/:team_id/messages/:searchterm
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |
| searchterm |  |  |



### 6. /search/:team_id/files/:search_term - Search for File


Finds and returns any files in a team that match a search term, regardless of the chat they were posted in.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/:team_id/messages/:searchterm
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |
| searchterm |  |  |



### 7. /search/:team_id/workspace/:search_term - Search for Workspace event


Finds and returns any workspace items in a team that match a search term, regardless of the chat they originated from.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/search/:team_id/messages/:searchterm
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |
| searchterm |  |  |



## Calls/Call Queues/Queues



### 1. /CCQueueConfig - Create Call Queue



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{api_server}}/CCQueueConfig
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |
| Authorization | Bearer {{token}} |  |



***Body:***

```js        
{  "team": "{{team_id}}",  "name": "Q3",  "call_service_good": 10,  "managers": ["{{user_id}}"]}
```



### 2. /CCQueueConfig/:queue_id - Get Queue



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/CCQueueConfig/a0f2da879f83e90865ac6dd06d99a4bb2
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |
| Authorization | Bearer {{token}} |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| populate | managers,agents  |  |



### 3. /team/:team_id/ccqueueconfig - Get all team Queues



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/:team_id/ccqueueconfig
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



### 4. /CCQueueConfig/:queue_id - Update Queue



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/CCQueueConfig/aea46b572241bd0852bec355b1f898454
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "team": "{{team_id}}",  "strategy": "ring-progressively",  "managers": ["{{user_id}}"]}
```



### 5. /CCQueueConfig/:team_id - Delete Queue



***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/CCQueueConfig/aac259c130aaaec31641d525ffbc04e57
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 6. /CCQueueConfig/:queue_id/agent/:agent_id - Add Agent to Queue



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/CCQueueConfig/ab3df0f92b7b953ba99e278ae77537db0/agent/ab3df0f92b7b953ba99e278ae77537db0
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 7. /CCQueueConfig/:queue_id/agent/:agent_id - Remove Agent from Queue



***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/CCQueueConfig/ab3df0f92b7b953ba99e278ae77537db0/agent/aea93eeef316177ec14b00aaa8f645c42
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



## Calls/Call Queues/Agents



### 1. /CCAgentConfig - Create agent



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/CCAgentConfig
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "user": "a60a65d4938849eb1f35cd430a7c18252",  "name": "Kate"}
```



### 2. /CCAgentConfig/:agent_id/setstatus - Set Agent status



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/CCAgentConfig/ab3df0f92b7b953ba99e278ae77537db0/setstatus
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "queueId": "ab3df0f92b7b953ba99e278ae77537db0",  "status": "Available"}
```



### 3. /CCAgentConfig/:agent_id/live - Get Agent's live queue



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/CCAgentConfig/ab3df0f92b7b953ba99e278ae77537db0/live
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 4. /CCAgentConfig/:agent_id - Get Agent



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/CCAgentConfig/ab3df0f92b7b953ba99e278ae77537db0
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 5. /TeamUser/:user_id/CCAgentConfig  - Get all team Agents



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/TeamUser/:team_user_id/CCAgentConfig
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| populate | queues |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_user_id |  |  |



### 6. /CCAgentConfig/:agent_id - Update agent



***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/CCAgentConfig/a56352b35ab0ee06e29d6466bdd0911f6
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "name": "Ursula@calling"}
```



### 7. /CCAgentConfig/:agent_id - Delete agent



***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/CCAgentConfig/ab3df0f92b7b953ba99e278ae77537db0
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



## Calls/DID / Phone Numbers



### 1. /didnumber - List all numbers


Lists all DID numbers owned by the team.


***Endpoint:***

```bash
Method: POST
Type: 
URL: {{apiBasepath}}/didnumber
```



### 2. /didnumber - Create DID number


Creates a DID number by buying one matching a user's criteria


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/didnumber
```



### 3. /didnumber/:id - Get DID number


Loads the information for a single DID


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/didnumber/:id
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 4. /didnumber/:id - Update DID number


Loads the information for a single DID


***Endpoint:***

```bash
Method: PATCH
Type: 
URL: {{apiBasepath}}/didnumber/:id
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



## Calls/Call Routing



### 1. /callroute - Create call route


Creates a call route, which allows a user to create a branching decision tree for directing calls, made up of multiple *blocks*


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/callroute
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| userid | asdf | ID of the user to look for voicemails for |
| slug | asdf | Slug of the team to look for voicemails on |



### 2. /callroute/:id - Delete call route


Deletes a call route


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/callroute/asdf
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| userid | asdf | ID of the user to look for voicemails for |
| slug | asdf | Slug of the team to look for voicemails on |



### 3. /callroute/:id - Edit call route


Returns a list of all voicemails in the user's inbox.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/callroute/asdf
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| userid | asdf | ID of the user to look for voicemails for |
| slug | asdf | Slug of the team to look for voicemails on |



### 4. /callroute/:id - Get call route


Returns a list of all voicemails in the user's inbox.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/callroute/asdf
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| userid | asdf | ID of the user to look for voicemails for |
| slug | asdf | Slug of the team to look for voicemails on |



### 5. /callroute - List all call routes


Returns a list of all voicemails in the user's inbox.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/callroute/asdf
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| userid | asdf | ID of the user to look for voicemails for |
| slug | asdf | Slug of the team to look for voicemails on |



## Calls/Voicemail



### 1. /voicemail - List voicemails


Returns a list of all voicemails in the user's inbox.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/voicemail
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| userid | asdf | ID of the user to look for voicemails for |
| slug | asdf | Slug of the team to look for voicemails on |



## Calls/Call Logs



### 1. /call-log - Get list of call logs


Loads a list of all call logs for the user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/call-log
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| limit | 1000 | Maximum number of results to show |
| skip | 1 | Number of results to skip over |



## Integrations/Event



### 1. /integration/:integration_id/event - Create event


Creates an event on a user's Integration, and a Debrief Meeting at the same time


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/event
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"name": "Important meeting",	"team": "a5124f164c0f1715ad05ed2c081f61137",	"users": ["abc123", "abc123"],	"notes": "We have to discuss that thing I sent you",	"host": "a118960aa0b70b1dec0d3d329b8b3b3f1",	"start": "2018-09-15T15:53:00",	"end": "2018-09-15T19:53:00",	"timezone": "-0500"}
```



### 2. /integration/:integration_id/event - Get event list


Gets all the events scheduled for an integration.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/integration/ab4cc8619dcc2d12eb76290d4f21ef1fb/event
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 3. /integration/:integration_id/event/:event_id - Delete event


Deletes an event from an integration, and archives the associated chat.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/event/:event_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| event_id |  |  |



***Body:***

```js        
{	"name": "Important meeting",	"team": "a5124f164c0f1715ad05ed2c081f61137",	"users": [],	"notes": "We have to discuss that thing I sent you",	"host": "a118960aa0b70b1dec0d3d329b8b3b3f1",	"start": "2018-09-15T15:53:00",	"end": "2018-09-15T19:53:00",	"timezone": "America/Toronto"}
```



### 4. /integration/:integration_id/event/:event_id - Update event


Updates an integration event and the associated meeting


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/event/:event_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| event_id |  |  |



***Body:***

```js        
{	"name": "Important meeting",	"team": "a5124f164c0f1715ad05ed2c081f61137",	"users": [],	"notes": "We have to discuss that thing I sent you",	"host": "a118960aa0b70b1dec0d3d329b8b3b3f1",	"start": "2018-09-15T15:53:00",	"end": "2018-09-15T19:53:00",	"timezone": "America/Toronto"}
```



### 5. /integration/:integration_id/event/:event_id/user - Add guest to event


Adds one or more email addresses to an event.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/event/:event_id/user
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| event_id |  |  |



***Body:***

```js        
{	"emails": ["user1@example.com", "user2@example.com"]}
```



### 6. /integration/:integration_id/event/:event_id/user/:email - Remove guest from event


Adds one or more email addresses to an event.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/event/:event_id/user/guestuser@example.com
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| event_id |  |  |



## Integrations/Contacts



### 1. /contact - Create contact


*Contacts* allows users to store contact information, and to synchronize it through Integrations. Contacts can also be stored without an associated integration


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/contact
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"first_name": "asdf",	"last_name": "asdf",	"email": "user@example.com",	"work_number": "+18888988826",	"home_number": "+18888988826",	"cell_number": "+18888988826"}
```



***Responses:***


Status: Create contacat with all fields | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 272 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 08 May 2018 18:34:41 GMT |
| ETag | W/"110-yYznuFk3iLCjkfFSqqZ9Pg" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{    "first_name": "Jane",    "last_name": "Doe",    "email": "user@example.com",    "work_number": "+18888988826",    "home_number": "+18888988826",    "cell_number": "+18888988826",    "id": "a66c8e9a1c28afd5e36a102fefd954f96",    "owner": "a9090474a9b626f43d0b42b4cc67d483e"}
```



### 2. /contact - Get contact list


Gets the list of all contacts visible for the current user


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/contact
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 3. /contact/:id - Get contact


Retrieve an individual contact


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/contact/a66c8e9a1c28afd5e36a102fefd954f96
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 4. /contact/:id - Update contact


Updates the information for a contact


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/contact/a66c8e9a1c28afd5e36a102fefd954f96
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"first_name": "asdf",	"last_name": "asdf",	"email": "user@example.com",	"work_number": "+18888988826",	"home_number": "+18888988826",	"cell_number": "+18888988826"}
```



### 5. /contact/:id - Delete contact


Removes a contact using its ID


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/contact/a66c8e9a1c28afd5e36a102fefd954f96
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 6. /integration/:integration_id/contacts - Get integration contact list


Gets the list of all contacts visible for the current user


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/contacts
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 7. /integration/:integration_id/contacts/:id - Get integration contact


Gets an individual integration contact


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/integration/a402f68ba84cd16cd4ef886200729c91e/contacts/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



## Integrations/General



### 1. /integration - Create integration


A Debrief *integration* is a third-party service that can be connected to a user's account, and provides synced access to information like contacts and calendar events. The current options for integrations are Google, Microsoft Exchange and Office365.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/integration
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  "type": "contacts|events",  "provider": "google|office365|microsoft",  "client": "my-app-name",  "code": "google-token|",  "email": "exchangeuser@example.com",  "domain": null}
```



### 2. /integration/:id - Get integration


Gets an individual integration


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/integration/:id
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 3. /integration - List all integrations


Lists all the integrations for the current user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/integration
```



### 4. /integration/:id - Update integration


Updates the details of an existing integration.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/integration/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



***Body:***

```js        
{  "type": "contacts|events",  "provider": "google|office365|microsoft",  "client": "my-app-name",  "code": "google-token|",  "email": "exchangeuser@example.com",  "domain": null}
```



### 5. /integration/:id - Delete integration


Deletes an existing integration for a user


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/integration/:id
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



***Body:***

```js        
{  "type": "contacts|events",  "provider": "google|office365|microsoft",  "client": "my-app-name",  "code": "google-token|",  "email": "exchangeuser@example.com",  "domain": null}
```



## Chats/Files



### 1. /chat/:id/files - Get chat files


Loads a list of all files in a given chat.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/files
```



### 2. /file - List all files


Loads a list of all files visible to a user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/file
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| team | a5b63640e8d2af8bb894778fa8fdb6794 | The ID of the team to search for files in |



***Responses:***


Status: /files - List all files | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 138268 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 14 May 2018 15:35:08 GMT |
| ETag | W/"21c1c-khAA99INZLXET1/vDksPjg" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[    {        "name": "fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",        "filename": "room91ef370fcda227f13fafc958e4d2c491@1489166977550.mp4",        "extension": "mp4",        "size": 481613,        "thumbWidth": null,        "thumbHeight": null,        "created_at": "2017-03-10T17:30:15.000Z",        "createdAt": "2017-03-10T17:30:15.000Z",        "routing_audio": null,        "url": "https://s3.amazonaws.com/df-stg-assets/fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",        "thumb_url": null,        "comment": null,        "teamuser": 29,        "team": "a5b63640e8d2af8bb894778fa8fdb6794",        "id": "a4693f8705aaa2f37e18f35172ecb1b96",        "user": {            "role": "admin",            "position": "",            "accepted": "2017-01-19T15:59:53.000Z",            "first_name": "Matt",            "last_name": "Mollon",            "color": "f864b1",            "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",            "email": "matt@debrief.com",            "notification": true,            "status": "active",            "state": "offline",            "extension": [                "111"            ],            "last_login": "2017-10-04T18:06:42.000Z",            "created_at": "2017-01-19T15:59:53.000Z",            "deleted_at": null,            "work_number": null,            "home_number": null,            "mobile_number": null,            "website": null,            "caller_id_name": null,            "caller_id_number": null,            "voicemail": false,            "forward": false,            "forward_number": null,            "latitude": null,            "longitude": null,            "theme": "light",            "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",            "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",            "id": "a9090474a9b626f43d0b42b4cc67d483e",            "team": "a5b63640e8d2af8bb894778fa8fdb6794",            "plan": "a00716cfa293f68439b4fe1162ba906da",            "defaultCalendar": "a402f68ba84cd16cd4ef886200729c91e",            "defaultContacts": "a402f68ba84cd16cd4ef886200729c91e",            "user": "a9090474a9b626f43d0b42b4cc67d483e",            "routes": []        },        "chat": {            "type": "room",            "name": "Transcription",            "purpose": null,            "created_at": "2017-03-10T17:12:57.000Z",            "updated_at": "2017-03-10T17:13:50.000Z",            "url": "transcription",            "last_message_time": "2017-03-10T17:13:04.000Z",            "roomNumber": 12425,            "callcenter_ring": null,            "callcenter_voicemail_password": null,            "callcenter_max_time": null,            "callcenter_hold_music": null,            "color": "fdd576",            "avatar": "https://s3.amazonaws.com/df-stg-assets/953f2b2c-a358-423d-a19d-875e43c5a526.png",            "conf_pin": 44215,            "message_updated_time": null,            "id": "a91ef370fcda227f13fafc958e4d2c491",            "team": "a5b63640e8d2af8bb894778fa8fdb6794",            "pin": "a61c3b7af2513bc4ad175049987a0ab10",            "messages": [],            "links": [],            "files": [],            "callcenter_transfer_to": null,            "routes": [],            "users": [                {                    "role": "member",                    "position": null,                    "accepted": "2017-01-19T15:55:54.000Z",                    "first_name": "Daniel",                    "last_name": "Audino",                    "color": "f864b1",                    "avatar": "https://df-stg-assets.s3.amazonaws.com/debrief-staging/office365_title.png",                    "email": "daniel@debrief.com",                    "notification": true,                    "status": "active",                    "state": "offline",                    "extension": [                        "108",                        "11111"                    ],                    "last_login": "2017-09-20T21:39:54.000Z",                    "created_at": "2017-01-19T15:55:54.000Z",                    "deleted_at": null,                    "work_number": null,                    "home_number": null,                    "mobile_number": null,                    "website": null,                    "caller_id_name": null,                    "caller_id_number": null,                    "voicemail": false,                    "forward": false,                    "forward_number": null,                    "latitude": null,                    "longitude": null,                    "theme": "dark",                    "thumb_url": null,                    "teamUserId": "a678ef79977a8a2beb1de91bf113e5032",                    "id": "a678ef79977a8a2beb1de91bf113e5032",                    "team": "a5b63640e8d2af8bb894778fa8fdb6794",                    "plan": "a00716cfa293f68439b4fe1162ba906da",                    "defaultCalendar": "a3d6ca50552ec44d8eef0212ed69dce77",                    "defaultContacts": "a3d6ca50552ec44d8eef0212ed69dce77",                    "user": "a678ef79977a8a2beb1de91bf113e5032",                    "routes": []                },                {                    "role": "admin",                    "position": "",                    "accepted": "2017-01-19T15:59:53.000Z",                    "first_name": "Matt",                    "last_name": "Mollon",                    "color": "f864b1",                    "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",                    "email": "matt@debrief.com",                    "notification": true,                    "status": "active",                    "state": "offline",                    "extension": [                        "111"                    ],                    "last_login": "2017-10-04T18:06:42.000Z",                    "created_at": "2017-01-19T15:59:53.000Z",                    "deleted_at": null,                    "work_number": null,                    "home_number": null,                    "mobile_number": null,                    "website": null,                    "caller_id_name": null,                    "caller_id_number": null,                    "voicemail": false,                    "forward": false,                    "forward_number": null,                    "latitude": null,                    "longitude": null,                    "theme": "light",                    "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",                    "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",                    "id": "a9090474a9b626f43d0b42b4cc67d483e",                    "team": "a5b63640e8d2af8bb894778fa8fdb6794",                    "plan": "a00716cfa293f68439b4fe1162ba906da",                    "defaultCalendar": "a402f68ba84cd16cd4ef886200729c91e",                    "defaultContacts": "a402f68ba84cd16cd4ef886200729c91e",                    "user": "a9090474a9b626f43d0b42b4cc67d483e",                    "routes": []                }            ],            "owner": "a9090474a9b626f43d0b42b4cc67d483e"        }    }]
```



### 3. /file/:id - Get file


Loads the information for an individual file


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/file/a4693f8705aaa2f37e18f35172ecb1b96
```



***Responses:***


Status: /file/:id - Get file | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 5941 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 14 May 2018 15:43:18 GMT |
| ETag | W/"1735-WT7iC8O9U9oAvLUBs6tL/Q" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[  {    "name": "fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",    "filename": "room91ef370fcda227f13fafc958e4d2c491@1489166977550.mp4",    "extension": "mp4",    "size": 481613,    "thumbWidth": null,    "thumbHeight": null,    "created_at": "2017-03-10T17:30:15.000Z",    "createdAt": "2017-03-10T17:30:15.000Z",    "routing_audio": null,    "url": "https://s3.amazonaws.com/df-stg-assets/fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",    "thumb_url": null,    "comment": null,    "teamuser": 29,    "team": "a5b63640e8d2af8bb894778fa8fdb6794",    "id": "a4693f8705aaa2f37e18f35172ecb1b96",    "user": {      "role": "admin",      "position": "",      "accepted": "2017-01-19T15:59:53.000Z",      "first_name": "Matt",      "last_name": "Mollon",      "color": "f864b1",      "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",      "email": "matt@debrief.com",      "notification": true,      "status": "active",      "state": "offline",      "extension": [        "111"      ],      "last_login": "2017-10-04T18:06:42.000Z",      "created_at": "2017-01-19T15:59:53.000Z",      "deleted_at": null,      "work_number": null,      "home_number": null,      "mobile_number": null,      "website": null,      "caller_id_name": null,      "caller_id_number": null,      "voicemail": false,      "forward": false,      "forward_number": null,      "latitude": null,      "longitude": null,      "theme": "light",      "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",      "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",      "id": "a9090474a9b626f43d0b42b4cc67d483e",      "team": "a5b63640e8d2af8bb894778fa8fdb6794",      "plan": "a00716cfa293f68439b4fe1162ba906da",      "defaultCalendar": "a402f68ba84cd16cd4ef886200729c91e",      "defaultContacts": "a402f68ba84cd16cd4ef886200729c91e",      "user": "a9090474a9b626f43d0b42b4cc67d483e",      "routes": []    },    "chat": {      "type": "room",      "name": "Transcription",      "purpose": null,      "created_at": "2017-03-10T17:12:57.000Z",      "updated_at": "2017-03-10T17:13:50.000Z",      "url": "transcription",      "last_message_time": "2017-03-10T17:13:04.000Z",      "roomNumber": 12425,      "callcenter_ring": null,      "callcenter_voicemail_password": null,      "callcenter_max_time": null,      "callcenter_hold_music": null,      "color": "fdd576",      "avatar": "https://s3.amazonaws.com/df-stg-assets/953f2b2c-a358-423d-a19d-875e43c5a526.png",      "conf_pin": 44215,      "message_updated_time": null,      "id": "a91ef370fcda227f13fafc958e4d2c491",      "team": "a5b63640e8d2af8bb894778fa8fdb6794",      "pin": "a61c3b7af2513bc4ad175049987a0ab10",      "messages": [],      "links": [],      "files": [],      "callcenter_transfer_to": null,      "routes": [],      "users": [        {          "role": "member",          "position": null,          "accepted": "2017-01-19T15:55:54.000Z",          "first_name": "Daniel",          "last_name": "Audino",          "color": "f864b1",          "avatar": "https://df-stg-assets.s3.amazonaws.com/debrief-staging/office365_title.png",          "email": "daniel@debrief.com",          "notification": true,          "status": "active",          "state": "offline",          "extension": [            "108",            "11111"          ],          "last_login": "2017-09-20T21:39:54.000Z",          "created_at": "2017-01-19T15:55:54.000Z",          "deleted_at": null,          "work_number": null,          "home_number": null,          "mobile_number": null,          "website": null,          "caller_id_name": null,          "caller_id_number": null,          "voicemail": false,          "forward": false,          "forward_number": null,          "latitude": null,          "longitude": null,          "theme": "dark",          "thumb_url": null,          "teamUserId": "a678ef79977a8a2beb1de91bf113e5032",          "id": "a678ef79977a8a2beb1de91bf113e5032",          "team": "a5b63640e8d2af8bb894778fa8fdb6794",          "plan": "a00716cfa293f68439b4fe1162ba906da",          "defaultCalendar": "a3d6ca50552ec44d8eef0212ed69dce77",          "defaultContacts": "a3d6ca50552ec44d8eef0212ed69dce77",          "user": "a678ef79977a8a2beb1de91bf113e5032",          "routes": []        },        {          "role": "admin",          "position": "",          "accepted": "2017-01-19T15:59:53.000Z",          "first_name": "Matt",          "last_name": "Mollon",          "color": "f864b1",          "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",          "email": "matt@debrief.com",          "notification": true,          "status": "active",          "state": "offline",          "extension": [            "111"          ],          "last_login": "2017-10-04T18:06:42.000Z",          "created_at": "2017-01-19T15:59:53.000Z",          "deleted_at": null,          "work_number": null,          "home_number": null,          "mobile_number": null,          "website": null,          "caller_id_name": null,          "caller_id_number": null,          "voicemail": false,          "forward": false,          "forward_number": null,          "latitude": null,          "longitude": null,          "theme": "light",          "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",          "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",          "id": "a9090474a9b626f43d0b42b4cc67d483e",          "team": "a5b63640e8d2af8bb894778fa8fdb6794",          "plan": "a00716cfa293f68439b4fe1162ba906da",          "defaultCalendar": "a402f68ba84cd16cd4ef886200729c91e",          "defaultContacts": "a402f68ba84cd16cd4ef886200729c91e",          "user": "a9090474a9b626f43d0b42b4cc67d483e",          "routes": []        }      ],      "owner": "a9090474a9b626f43d0b42b4cc67d483e"    }  }]
```



### 4. /file/:id - Update file


Updates information about a file


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/file/a4693f8705aaa2f37e18f35172ecb1b96
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"name": "fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",	"filename": "room91ef370fcda227f13fafc958e4d2c491@1489166977550.mp4",	"extension": "mp4",	"size": 481613,	"thumbWidth": null,	"thumbHeight": null,	"created_at": "2017-03-10T17:30:15.000Z",    "createdAt": "2017-03-10T17:30:15.000Z",    "routing_audio": null,    "url": "https://s3.amazonaws.com/df-stg-assets/fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",    "thumb_url": null,    "comment": null,    "teamuser": 29,    "team": "a5b63640e8d2af8bb894778fa8fdb6794",    "id": "a4693f8705aaa2f37e18f35172ecb1b96"}
```



***Responses:***


Status: /file/:id - Get file | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 5941 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 14 May 2018 15:43:18 GMT |
| ETag | W/"1735-WT7iC8O9U9oAvLUBs6tL/Q" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[  {    "name": "fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",    "filename": "room91ef370fcda227f13fafc958e4d2c491@1489166977550.mp4",    "extension": "mp4",    "size": 481613,    "thumbWidth": null,    "thumbHeight": null,    "created_at": "2017-03-10T17:30:15.000Z",    "createdAt": "2017-03-10T17:30:15.000Z",    "routing_audio": null,    "url": "https://s3.amazonaws.com/df-stg-assets/fe27c165-b6e5-49dd-b30e-8c5a6031e576.mp4",    "thumb_url": null,    "comment": null,    "teamuser": 29,    "team": "a5b63640e8d2af8bb894778fa8fdb6794",    "id": "a4693f8705aaa2f37e18f35172ecb1b96",    "user": {      "role": "admin",      "position": "",      "accepted": "2017-01-19T15:59:53.000Z",      "first_name": "Matt",      "last_name": "Mollon",      "color": "f864b1",      "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",      "email": "matt@debrief.com",      "notification": true,      "status": "active",      "state": "offline",      "extension": [        "111"      ],      "last_login": "2017-10-04T18:06:42.000Z",      "created_at": "2017-01-19T15:59:53.000Z",      "deleted_at": null,      "work_number": null,      "home_number": null,      "mobile_number": null,      "website": null,      "caller_id_name": null,      "caller_id_number": null,      "voicemail": false,      "forward": false,      "forward_number": null,      "latitude": null,      "longitude": null,      "theme": "light",      "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",      "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",      "id": "a9090474a9b626f43d0b42b4cc67d483e",      "team": "a5b63640e8d2af8bb894778fa8fdb6794",      "plan": "a00716cfa293f68439b4fe1162ba906da",      "defaultCalendar": "a402f68ba84cd16cd4ef886200729c91e",      "defaultContacts": "a402f68ba84cd16cd4ef886200729c91e",      "user": "a9090474a9b626f43d0b42b4cc67d483e",      "routes": []    },    "chat": {      "type": "room",      "name": "Transcription",      "purpose": null,      "created_at": "2017-03-10T17:12:57.000Z",      "updated_at": "2017-03-10T17:13:50.000Z",      "url": "transcription",      "last_message_time": "2017-03-10T17:13:04.000Z",      "roomNumber": 12425,      "callcenter_ring": null,      "callcenter_voicemail_password": null,      "callcenter_max_time": null,      "callcenter_hold_music": null,      "color": "fdd576",      "avatar": "https://s3.amazonaws.com/df-stg-assets/953f2b2c-a358-423d-a19d-875e43c5a526.png",      "conf_pin": 44215,      "message_updated_time": null,      "id": "a91ef370fcda227f13fafc958e4d2c491",      "team": "a5b63640e8d2af8bb894778fa8fdb6794",      "pin": "a61c3b7af2513bc4ad175049987a0ab10",      "messages": [],      "links": [],      "files": [],      "callcenter_transfer_to": null,      "routes": [],      "users": [        {          "role": "member",          "position": null,          "accepted": "2017-01-19T15:55:54.000Z",          "first_name": "Daniel",          "last_name": "Audino",          "color": "f864b1",          "avatar": "https://df-stg-assets.s3.amazonaws.com/debrief-staging/office365_title.png",          "email": "daniel@debrief.com",          "notification": true,          "status": "active",          "state": "offline",          "extension": [            "108",            "11111"          ],          "last_login": "2017-09-20T21:39:54.000Z",          "created_at": "2017-01-19T15:55:54.000Z",          "deleted_at": null,          "work_number": null,          "home_number": null,          "mobile_number": null,          "website": null,          "caller_id_name": null,          "caller_id_number": null,          "voicemail": false,          "forward": false,          "forward_number": null,          "latitude": null,          "longitude": null,          "theme": "dark",          "thumb_url": null,          "teamUserId": "a678ef79977a8a2beb1de91bf113e5032",          "id": "a678ef79977a8a2beb1de91bf113e5032",          "team": "a5b63640e8d2af8bb894778fa8fdb6794",          "plan": "a00716cfa293f68439b4fe1162ba906da",          "defaultCalendar": "a3d6ca50552ec44d8eef0212ed69dce77",          "defaultContacts": "a3d6ca50552ec44d8eef0212ed69dce77",          "user": "a678ef79977a8a2beb1de91bf113e5032",          "routes": []        },        {          "role": "admin",          "position": "",          "accepted": "2017-01-19T15:59:53.000Z",          "first_name": "Matt",          "last_name": "Mollon",          "color": "f864b1",          "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",          "email": "matt@debrief.com",          "notification": true,          "status": "active",          "state": "offline",          "extension": [            "111"          ],          "last_login": "2017-10-04T18:06:42.000Z",          "created_at": "2017-01-19T15:59:53.000Z",          "deleted_at": null,          "work_number": null,          "home_number": null,          "mobile_number": null,          "website": null,          "caller_id_name": null,          "caller_id_number": null,          "voicemail": false,          "forward": false,          "forward_number": null,          "latitude": null,          "longitude": null,          "theme": "light",          "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",          "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",          "id": "a9090474a9b626f43d0b42b4cc67d483e",          "team": "a5b63640e8d2af8bb894778fa8fdb6794",          "plan": "a00716cfa293f68439b4fe1162ba906da",          "defaultCalendar": "a402f68ba84cd16cd4ef886200729c91e",          "defaultContacts": "a402f68ba84cd16cd4ef886200729c91e",          "user": "a9090474a9b626f43d0b42b4cc67d483e",          "routes": []        }      ],      "owner": "a9090474a9b626f43d0b42b4cc67d483e"    }  }]
```



### 5. /file - Upload file


Uploads a file


***Endpoint:***

```bash
Method: POST
Type: FORMDATA
URL: {{apiBasepath}}/file
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/x-www-form-urlencoded |  |



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| name | Something.jpeg |  |
| extension | jpeg |  |
| location | Bogota |  |
| date | Sun Nov 26 2017 19:57:05 GMT-0500 (EST) |  |
| category | Speeding fine |  |
| file |  |  |
| team | debrief-staging |  |



## Chats/Links



### 1. /chat/:id/links - Get chat links


Retrieves an array of all links sent in a specific chat.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/links
```



### 2. /link - Get user links


Loads all links sent by the current user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/link
```



## Chats/Messages



### 1. /chat/:id/messages - Get chat messages


This gets an array of all the chats visible to the current user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a89e3026f01665a6e7dc9cf60906d08cf/messages
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| type | room|private | Filter by type |
| from | senderId | Filter by a specific sender by their ID |
| limit | 100 | Maximum number of messages to return |
| skip | 0 | Number of messages to skip over (use with `limit` for pagination) |
| where | { "type": "text" } | See http://sailsjs.org/documentation/concepts/models-and-orm/query-language |
| search |  | Search query to match against available text fields |
| populate | from | Optionally include sender information |



***Responses:***


Status: Get chat messages - text only, first 100 | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 15243 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 20:26:53 GMT |
| ETag | W/"3b8b-VjZxRhf/GlGrA4MgwqYpfQ" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[    {        "type": "text",        "body": "hola :fire:",        "created_at": "2017-02-28T02:44:23.000Z",        "file": null,        "links": null,        "room_mentions": [],        "id": "a947e6e514016dc3f516623e77b7da9cd",        "chat": "a89e3026f01665a6e7dc9cf60906d08cf",        "user_mentions": [],        "from": "ad5dd00c9bf7e7796075af807176255d7",        "language": "es"    },    {        "type": "text",        "body": "hey <mention user='ad5dd00c9bf7e7796075af807176255d7'>matt</mention>!",        "created_at": "2017-02-28T02:44:21.000Z",        "file": null,        "links": null,        "room_mentions": [],        "id": "a80e4c520df0d291bc88c339159964a5c",        "chat": "a89e3026f01665a6e7dc9cf60906d08cf",        "user_mentions": [],        "from": "a8154917fb8693da807a151d5734dc162",        "language": "en"    },    ... ]
```



### 2. /chat/:id/messages - Send chat message


Sends a message


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



***Body:***

```js        
{  "type": "text",  "body": "Something!"}
```



### 3. /chat/:id/messages/:msg_id/thread - Get chat message replies


Gets a list of all the replies to this message, otherwise known as the thread


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a89e3026f01665a6e7dc9cf60906d08cf/messages/a63a04b6f6c96efc81d375407e62e9a21/thread
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| type | room|private | Filter by type |
| from | senderId | Filter by a specific sender by their ID |
| search |  | Search query to match against available text fields |



***Responses:***


Status: Get chat messages - text only, first 100 | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 15243 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 20:26:53 GMT |
| ETag | W/"3b8b-VjZxRhf/GlGrA4MgwqYpfQ" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
[  {    "type": "text",    "body": "hey",    "created_at": "2017-02-28T02:44:23.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a947e6e514016dc3f516623e77b7da9cd",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "ad5dd00c9bf7e7796075af807176255d7",    "language": "en"  },  {    "type": "text",    "body": "hey matt",    "created_at": "2017-02-28T02:44:21.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a80e4c520df0d291bc88c339159964a5c",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": ":confused:",    "created_at": "2017-01-31T02:46:06.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a82dc89fb4a510b04f1b29b710393d8ef",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a9090474a9b626f43d0b42b4cc67d483e",    "language": "en"  },  {    "type": "text",    "body": ":stuck_out_tongue_closed_eyes::drooling_face:",    "created_at": "2017-01-30T23:16:35.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a9b730b7c2255f68bd0dcf47308ebd7f7",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a9090474a9b626f43d0b42b4cc67d483e",    "language": "en"  },  {    "type": "text",    "body": ":smile:",    "created_at": "2017-01-30T23:16:30.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "acd9d8d8c051bb7444d95be77ff9fd943",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a9090474a9b626f43d0b42b4cc67d483e",    "language": "en"  },  {    "type": "text",    "body": "<p><strong>bold test</strong></p>",    "created_at": "2017-01-30T19:14:35.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "ae7adaaa4f50293c0db458ec93034c438",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a9090474a9b626f43d0b42b4cc67d483e",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:59.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a86f3d61351ddc59fc5d77c173fba0feb",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>asd</p>",    "created_at": "2017-01-28T18:42:59.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a33c01a7f63da7177421c31b4715494d7",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>d</p>",    "created_at": "2017-01-28T18:42:59.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a08ec444105a9df7a7e4df3a3acae9a57",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:59.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "aed5eeb2338a6563ef5557bb851c4dcb9",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:58.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a48272f49588edd11422947f8cdde6f04",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:58.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a75233d2a2fd17e369af23b6941548b92",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>a</p>",    "created_at": "2017-01-28T18:42:58.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a9fcac572719df05ab7906ee20b81136c",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>d</p>",    "created_at": "2017-01-28T18:42:58.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a58e278d5657478ce6a66bae45d3028e7",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:58.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a2d174449dcdf9e6bf742f46852707fca",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:58.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a3a8d2652ac033fc777f38bcef7fcfd42",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:57.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a3e7e081ff88334daf8e51da96510cc0e",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:57.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a247a6179d284c457f5fa2cbd943dc8a9",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:57.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "ae8e0b7de6da90646c012bbbc1c146f47",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>a</p>",    "created_at": "2017-01-28T18:42:57.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "afe30d5676b79b5935414a10c8a24376a",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>asd</p>",    "created_at": "2017-01-28T18:42:57.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a4668bd557ddcd1f03b4f5f12a3cb9db1",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>asd</p>",    "created_at": "2017-01-28T18:42:57.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a7ac844582d20c7b6865d8a22336269f7",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>asd</p>",    "created_at": "2017-01-28T18:42:56.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "abbec219edc7b40cc62ab7fec5bae33e8",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sdasdasd</p>",    "created_at": "2017-01-28T18:42:56.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "ab26f26b6193c2049fdcb60e4c41b6918",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "aea25ffe057141947aa85d646a4fa7ea7",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a5a83592d5c26be210fb674b019812ee6",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a8ec79066ff3ec0a56481e761906d6ac9",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sda</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a37542cf542399a1923738718ded17d22",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>a</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a3a49a630c44e2ddfc1788609c62bada5",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a467ad2e5b6f94baa9da6f4113911365a",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:55.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a1739704648a1dc204131138b82cb331f",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:54.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a2f564dee4450372ff260d43afc0f099c",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:54.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a09d9ed083fb3c0fe71090c9de0aac9eb",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:54.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a9c6889033b2571eb3d0f645dde809be5",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:54.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a006b907fb9490cf3fef2ac641e104cca",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:54.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a28d58b8882b006edabd0bff1a4cb4d94",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:54.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a9e1717b18b602b57dd2461974ff6ca67",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>as</p>",    "created_at": "2017-01-28T18:42:53.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "ad098a041e57a4a3f60b51e46f6958012",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>asd</p>",    "created_at": "2017-01-28T18:42:53.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a7e0f8174b7b0972d1e8a4e1ac8a844d7",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sd</p>",    "created_at": "2017-01-28T18:42:53.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "adccb4401741185a9cf1286bdb404f207",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>sda</p>",    "created_at": "2017-01-28T18:42:53.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "a6b3c8e593fbeb6573446cf2230260c0c",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>da</p>",    "created_at": "2017-01-28T18:42:53.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "ac20a9c521690d76c014c7a33a693074c",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  },  {    "type": "text",    "body": "<p>asda</p>",    "created_at": "2017-01-28T18:42:52.000Z",    "file": null,    "links": null,    "room_mentions": [],    "id": "ad47141bec4afdf40cd40d8db19263f92",    "chat": "a89e3026f01665a6e7dc9cf60906d08cf",    "user_mentions": [],    "from": "a8154917fb8693da807a151d5734dc162",    "language": "en"  }]
```



### 4. /chat/:id/messages/:msg_id/thread - Send chat message reply


Sends a message as a response to another message, which will then be added to the message's thread.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/:msg_id/thread
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| msg_id |  |  |



***Body:***

```js        
{  "type": "text",  "body": "Something!"}
```



### 5. /chat/:id/messages/:msg_id/mark - Mark message


Marks a message as either pinned or unread. Both types will appear in the Workspace API. The result will contain the ID for this marker, which can be deleted with `DELETE /chat/:id/messages/:msg_id/mark/:mark_id`


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/:msg_id/mark
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| msg_id |  |  |



***Body:***

```js        
{  "type": "pin|unread"}
```



### 6. /chat/:id/messages/:msg_id/mark - Unmark message


Removes the mark on a message as either pinned or unread. Each marking has its own ID.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/:msg_id/mark/:mark_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| msg_id |  |  |
| mark_id |  |  |



### 7. /chat/:id/messages/:msg_id - Delete chat message


Deletes a message by its ID


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/a783844b05c32db9c43a1b1dc434071c0
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



***Body:***

```js        
{  "type": "text",  "body": "Something!"}
```



### 8. /chat/:id/messages/:msg_id - Edit chat message


Replaces the content of a chat message.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/a783844b05c32db9c43a1b1dc434071c0
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



***Body:***

```js        
{	"type": "text",	"body": "Something! ELSE"}
```



### 9. /chat/:id/messages/:msg_id/forward - Forward chat message


Duplicates an existing chat message and sends it to a new group or user. To forward a message to a group, send the paramater `forward_chat` with an array of Chat IDs. To forward a message to a user, send the paramater `users` with an array of User IDs. Each group/user will be forwarded the message. Private chats will be created automatically if one doesn't already exist with that user.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/a783844b05c32db9c43a1b1dc434071c0/forward
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"forward_chat": ["abc123"],	"users": ["abc123"]}
```



### 10. /chat/:id/messages/:msg_id/translate - Translate chat message


Loads the translation for a chat message using the `language` settings of the message sender and the current user as the input and output language, respectively. For example: if there are two users, one with the locale of `en-US` and another with `es-MX`, this endpoint will attempt to translate the message from English to Spanish.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/messages/a783844b05c32db9c43a1b1dc434071c0/translate
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/javascript |  |



### 11. /chat/messages/unread - Get unread messages


Loads all unread messages.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/messages/unread
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| team |  |  |
| type |  |  |
| chat |  |  |
| from |  |  |
| populate | chat,chatusers,from |  |



## Chats/General



### 1. /chat - Create chat


Creates a new chat, either a direct message or a group.## Required- `type` is either `private`, for a direct message  or `room` for a group- `team` is the ID of the team this chat should be created on## GroupsDebrief apps ignore these fields on direct messages, but you can still store them:- `name` the name of a group- `purpose` an optional description field for agenda, topic, etc


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
|  |  |  |
| Content-Type | application/json |  |



***Body:***

```js        
{  "name": "Chat name if it's a group",  "purpose": "something",  "type": "private|room",  "team": "team ID",                "users": ["otherUserId1", "otherUserId2"]}
```



***Responses:***


Status: Create private chat | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| connection | close |
| content-length | 749 |
| content-type | application/json; charset=utf-8 |
| date | Wed, 13 Dec 2017 18:26:13 GMT |
| etag | W/"2ed-wqDfu5SutNhh59HUuZTPcQ" |
| vary | X-HTTP-Method-Override |
| x-powered-by | Sails <sailsjs.org> |



```js
{  "type": "private|room",  "name": "Chat name if it's a group",  "purpose": "something",  "created_at": "2017-12-13T18:26:13.000Z",  "updated_at": "2017-12-13T18:26:13.000Z",  "locked": true,  "url": "chat-name-if-it's-a-group",  "last_message_time": null,  "roomNumber": 18348,  "callcenter_ring": null,  "callcenter_voicemail_password": null,  "callcenter_max_time": null,  "callcenter_hold_music": null,  "color": "f864b1",  "avatar": null,  "conf_pin": 94176,  "id": "ad63202ae19764ba2f619ce0758d3ece9",  "team": null,  "pin": "a09a9b439d0b5dd21961024ae0a444042",  "users": [],  "messages": [],  "links": [],  "files": [],  "callcenter_transfer_to": null,  "routes": [],  "owner": "a9090474a9b626f43d0b42b4cc67d483e"}
```



### 2. /chat - Get chats


This gets an array of all the chats visible to the current user. Requesting this endpoint with the socket will subscribe for events about new chats, and changes to any of the chats on the list.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| limit | 100 |  |
| skip | 0 |  |
| team | asdf1234 |  |



### 3. /chat/:id - Get chat


This gets an array of all the chats visible to the current user. If this is a socket connection, it subscribes the connection to these chats.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a89e3026f01665a6e7dc9cf60906d08cf
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| populate | messages,users,owner | Load some larger/slower properties optionally |



***Responses:***


Status: Get private chat | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 795 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 19:58:40 GMT |
| ETag | W/"31b-q7zLRnlIpJtMpIPwc/Af+A" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "type": "private",  "name": "",  "purpose": null,  "created_at": "2017-01-21T01:55:33.000Z",  "updated_at": "2017-01-21T01:55:33.000Z",  "favorite": true,  "unread": "0",  "locked": true,  "url": null,  "do_not_disturb": null,  "last_message_time": null,  "roomNumber": 11746,  "callcenter_ring": null,  "callcenter_voicemail_password": null,  "callcenter_max_time": null,  "callcenter_hold_music": null,  "color": "9c78cd",  "last_seen": "2017-12-12T19:18:01.000Z",  "avatar": null,  "conf_pin": 31906,  "users": [],  "messages": [],  "links": [],  "files": [],  "callcenter_transfer_to": null,  "routes": [],  "id": "a861ddc428066c8b397bf2783d13a5e30",  "team": "a5b63640e8d2af8bb894778fa8fdb6794",  "pin": null,  "owner": "a9090474a9b626f43d0b42b4cc67d483e"}
```



Status: Get group chat - all info | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 4655 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 20:16:10 GMT |
| ETag | W/"122f-fXfM7KBX82Yl7A5F9xFm5A" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "type": "room",  "name": "testingtest",  "purpose": "things",  "created_at": "2017-01-28T18:42:32.000Z",  "updated_at": "2017-04-24T21:28:12.000Z",  "favorite": true,  "unread": 0,  "locked": false,  "url": "testingtest",  "do_not_disturb": null,  "last_message_time": "2017-04-24T21:28:12.000Z",  "roomNumber": 11820,  "callcenter_ring": null,  "callcenter_voicemail_password": null,  "callcenter_max_time": null,  "callcenter_hold_music": null,  "color": "53d192",  "last_seen": "2017-05-06T19:43:26.000Z",  "avatar": null,  "conf_pin": 42734,  "messages": [],  "links": [],  "files": [],  "callcenter_transfer_to": null,  "routes": [],  "id": "a89e3026f01665a6e7dc9cf60906d08cf",  "team": "a5b63640e8d2af8bb894778fa8fdb6794",  "pin": "a960f9deecabf3cc025562567b689aa8e",  "owner": {    "role": "member",    "position": null,    "accepted": "2017-01-28T18:41:51.000Z",    "first_name": "Pickle",    "last_name": "Rick",    "color": "87b1c4",    "avatar": "https://df-stg-assets.s3.amazonaws.com/pickle_rick.jpeg",    "email": "matt.mollon@gmail.com",    "notification": true,    "status": "active",    "state": "online",    "extension": [      "125"    ],    "last_login": "2017-09-26T17:56:46.000Z",    "created_at": "2017-01-28T18:41:51.000Z",    "deleted_at": null,    "work_number": "6472422012",    "home_number": "6472422012",    "mobile_number": "6472422012",    "website": null,    "caller_id_name": null,    "caller_id_number": null,    "voicemail": false,    "forward": false,    "forward_number": null,    "latitude": null,    "longitude": null,    "theme": "dark",    "thumb_url": "https://s3.amazonaws.com/df-stg-assets/pickle_rick.jpeg",    "routes": [],    "defaultContacts": null,    "teamUserId": "a8154917fb8693da807a151d5734dc162",    "id": "a8154917fb8693da807a151d5734dc162",    "team": "a5b63640e8d2af8bb894778fa8fdb6794",    "plan": "a00716cfa293f68439b4fe1162ba906da",    "defaultCalendar": null,    "user": "a8154917fb8693da807a151d5734dc162"  },  "users": [    {      "role": "admin",      "position": "",      "accepted": "2017-01-19T15:59:53.000Z",      "first_name": "Matt",      "last_name": "Mollon",      "color": "f864b1",      "avatar": "https://df-stg-assets.s3.amazonaws.com/1f4eb%281%29.png",      "email": "matt@debrief.com",      "notification": true,      "status": "active",      "state": "offline",      "extension": [        "111"      ],      "last_login": "2017-10-04T18:06:42.000Z",      "created_at": "2017-01-19T15:59:53.000Z",      "deleted_at": null,      "work_number": null,      "home_number": null,      "mobile_number": null,      "website": null,      "caller_id_name": null,      "caller_id_number": null,      "voicemail": false,      "forward": false,      "forward_number": null,      "latitude": null,      "longitude": null,      "theme": "light",      "thumb_url": "https://s3.amazonaws.com/df-stg-assets/1f4eb%281%29.png",      "routes": [],      "defaultContacts": null,      "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",      "id": "a9090474a9b626f43d0b42b4cc67d483e",      "team": "a5b63640e8d2af8bb894778fa8fdb6794",      "plan": "a00716cfa293f68439b4fe1162ba906da",      "defaultCalendar": null,      "user": "a9090474a9b626f43d0b42b4cc67d483e"    },    {      "role": "member",      "position": null,      "accepted": "2017-01-28T18:41:51.000Z",      "first_name": "Pickle",      "last_name": "Rick",      "color": "87b1c4",      "avatar": "https://df-stg-assets.s3.amazonaws.com/pickle_rick.jpeg",      "email": "matt.mollon@gmail.com",      "notification": true,      "status": "active",      "state": "online",      "extension": [        "125"      ],      "last_login": "2017-09-26T17:56:46.000Z",      "created_at": "2017-01-28T18:41:51.000Z",      "deleted_at": null,      "work_number": "6472422012",      "home_number": "6472422012",      "mobile_number": "6472422012",      "website": null,      "caller_id_name": null,      "caller_id_number": null,      "voicemail": false,      "forward": false,      "forward_number": null,      "latitude": null,      "longitude": null,      "theme": "dark",      "thumb_url": "https://s3.amazonaws.com/df-stg-assets/pickle_rick.jpeg",      "routes": [],      "defaultContacts": null,      "teamUserId": "a8154917fb8693da807a151d5734dc162",      "id": "a8154917fb8693da807a151d5734dc162",      "team": "a5b63640e8d2af8bb894778fa8fdb6794",      "plan": "a00716cfa293f68439b4fe1162ba906da",      "defaultCalendar": null,      "user": "a8154917fb8693da807a151d5734dc162"    }  ]}
```



Status: Get private chat - all info | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 4496 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 20:14:51 GMT |
| ETag | W/"1190-SjojWf06MRed2SiNS46tLg" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
{    "type": "private",    "name": "",    "purpose": null,    "created_at": "2017-01-21T01:55:33.000Z",    "updated_at": "2017-01-21T01:55:33.000Z",    "favorite": true,    "unread": "0",    "locked": true,    "url": null,    "do_not_disturb": null,    "last_message_time": null,    "roomNumber": 11746,    "callcenter_ring": null,    "callcenter_voicemail_password": null,    "callcenter_max_time": null,    "callcenter_hold_music": null,    "color": "9c78cd",    "last_seen": "2017-12-12T19:18:01.000Z",    "avatar": null,    "conf_pin": 31906,    "messages": [],    "links": [],    "files": [],    "callcenter_transfer_to": null,    "routes": [],    "id": "a861ddc428066c8b397bf2783d13a5e30",    "team": "a5b63640e8d2af8bb894778fa8fdb6794",    "pin": null,    "owner": {        "role": "admin",        "position": "",        "accepted": "2017-01-19T15:59:53.000Z",        "first_name": "Jane",        "last_name": "Doe",        "color": "f864b1",        "avatar": "//",        "email": "//",        "notification": true,        "status": "active",        "state": "offline",        "extension": [            "111"        ],        "last_login": "2017-10-04T18:06:42.000Z",        "created_at": "2017-01-19T15:59:53.000Z",        "deleted_at": null,        "work_number": null,        "home_number": null,        "mobile_number": null,        "website": null,        "caller_id_name": null,        "caller_id_number": null,        "voicemail": false,        "forward": false,        "forward_number": null,        "latitude": null,        "longitude": null,        "theme": "light",        "thumb_url": "//",        "routes": [],        "defaultContacts": null,        "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",        "id": "a9090474a9b626f43d0b42b4cc67d483e",        "team": "a5b63640e8d2af8bb894778fa8fdb6794",        "plan": "a00716cfa293f68439b4fe1162ba906da",        "defaultCalendar": null,        "user": "a9090474a9b626f43d0b42b4cc67d483e"    },    "users": [        {            "role": "admin",            "position": null,            "accepted": "2017-01-19T15:54:31.000Z",            "first_name": "asdsafasd",            "last_name": "asd",            "color": "53d192",            "avatar": null,            "email": "asd",            "notification": true,            "status": "active",            "state": "online",            "extension": [                "106"            ],            "last_login": "2017-10-23T18:25:37.000Z",            "created_at": "2017-01-19T15:54:31.000Z",            "deleted_at": null,            "work_number": null,            "home_number": null,            "mobile_number": null,            "website": null,            "caller_id_name": null,            "caller_id_number": null,            "voicemail": false,            "forward": false,            "forward_number": null,            "latitude": null,            "longitude": null,            "theme": "dark",            "thumb_url": null,            "routes": [],            "teamUserId": "ad6bb3a2f914e83d4e6a83c1050e4eaf4",            "id": "ad6bb3a2f914e83d4e6a83c1050e4eaf4",            "team": "a5b63640e8d2af8bb894778fa8fdb6794",            "plan": "a00716cfa293f68439b4fe1162ba906da",            "defaultCalendar": "a1c95f8ca39eeb2ce9d6e6ce4347b549c",            "defaultContacts": "a1c95f8ca39eeb2ce9d6e6ce4347b549c",            "user": "ad6bb3a2f914e83d4e6a83c1050e4eaf4"        },        {            "role": "admin",            "position": "",            "accepted": "2017-01-19T15:59:53.000Z",            "first_name": "asdf",            "last_name": "asda",            "color": "f864b1",            "avatar": "//",            "email": "asdf@example.com",            "notification": true,            "status": "active",            "state": "offline",            "extension": [                "111"            ],            "last_login": "2017-10-04T18:06:42.000Z",            "created_at": "2017-01-19T15:59:53.000Z",            "deleted_at": null,            "work_number": null,            "home_number": null,            "mobile_number": null,            "website": null,            "caller_id_name": null,            "caller_id_number": null,            "voicemail": false,            "forward": false,            "forward_number": null,            "latitude": null,            "longitude": null,            "theme": "light",            "thumb_url": "//",            "routes": [],            "defaultContacts": null,            "teamUserId": "a9090474a9b626f43d0b42b4cc67d483e",            "id": "a9090474a9b626f43d0b42b4cc67d483e",            "team": "a5b63640e8d2af8bb894778fa8fdb6794",            "plan": "a00716cfa293f68439b4fe1162ba906da",            "defaultCalendar": null,            "user": "a9090474a9b626f43d0b42b4cc67d483e"        }    ]}
```



Status: Get group chat | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 868 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 19:56:35 GMT |
| ETag | W/"364-DzsuKD8UpZrID49cbuZkjw" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "type": "room",  "name": "testingtest",  "purpose": "things",  "created_at": "2017-01-28T18:42:32.000Z",  "updated_at": "2017-04-24T21:28:12.000Z",  "favorite": true,  "unread": 0,  "locked": false,  "url": "testingtest",  "do_not_disturb": null,  "last_message_time": "2017-04-24T21:28:12.000Z",  "roomNumber": 11820,  "callcenter_ring": null,  "callcenter_voicemail_password": null,  "callcenter_max_time": null,  "callcenter_hold_music": null,  "color": "53d192",  "last_seen": "2017-05-06T19:43:26.000Z",  "avatar": null,  "conf_pin": 42734,  "users": [],  "messages": [],  "links": [],  "files": [],  "callcenter_transfer_to": null,  "routes": [],  "id": "a89e3026f01665a6e7dc9cf60906d08cf",  "team": "a5b63640e8d2af8bb894778fa8fdb6794",  "pin": "a960f9deecabf3cc025562567b689aa8e",  "owner": "a8154917fb8693da807a151d5734dc162"}
```



### 4. /chat/:id - Update chat


Update the editable fields of a chat


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/chat/a89e3026f01665a6e7dc9cf60906d08cf
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"name": "new name",	"purpose": "new purpose",	"locked": false}
```



### 5. /chat/:id - Delete chat


Deletes a chat using it's ID


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/chat/a89e3026f01665a6e7dc9cf60906d08cf
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"name": "new name",	"purpose": "new purpose",	"locked": false}
```



### 6. /chat/:id/seen - Mark as read


Updates the last_seen time of this chat to the current server time.


***Endpoint:***

```bash
Method: POST
Type: 
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/seen
```



### 7. /chat/:id/users - Get chat users


Adds a user to a group chat.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 8. /chat/:id/users - Add user


Adds a user to a group chat.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"user": "team_user_id"}
```



### 9. /chat/:id/typing - Send typing event


Calling this on a chat will dispatch a socket event to all other participants of the chat indicating that the logged-in user has either started or stopped typing. Sending `typing: true` will mark the user as typing until another event with `typing: false` is sent.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/typing
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"typing": false}
```



### 10. /team/:team/chat/exists - Check if chat exists


Given a list of users, this will return any existing chats that contains all users in the list. When creating new group chats, this can be used to help the user avoid creating a duplicate chat.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/{{curTeamID}}/chat/exists
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| users | ['user1@example.com'] |  |



### 11. /chat/:id/users/:user_id - Remove user


Removes a user from a group chat.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{  }
```



### 12. /chat/:id/users/:user_id - Update chat user


Updates a user's preferences for a chat, which includes options for favouriting, pinning, or muting notifications.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/chat/a861ddc428066c8b397bf2783d13a5e30/user/:user_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| user_id |  |  |



***Body:***

```js        
{  "favorite": true,  "do_not_disturb": false,  "last_seen": "2018-05-02T16:33:15Z",	  "pinned": false}
```



### 13. /chat/:roomNumber/conference - Get conference details


Get the publicly visible information about a team, based on a conference room number.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/{{roomNumber}}/conference
```



***Responses:***


Status: Get conference details | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 95 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 19:15:27 GMT |
| ETag | W/"5f-LuVKxaHLyhaFZzDsfT3ujw" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "pin": 45243,  "slug": "debrief-staging",  "room": "ac4912fd1a77fa1d4d372ac7d993eb297"}
```



### 14. /chat/:id/generateUrl - Generate Guest URL


Group chats only. If guest access hasn't been enabled, this generates a new url for a chat. For chats with guest access already enabled, this will generate a new PIN and invalidate all existing Guest sessions. **Note**: The `locked` property won't change, so see PATCH /chat/:id to toggle guest access.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/chat/a89e3026f01665a6e7dc9cf60906d08cf/generateUrl
```



## Users & Teams/Guests



### 1. /guest/:guest_id - Get guest


Loads information about a guest


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: 
```



### 2. /guest/invite - Invite guest


Invite a guest to a chat using their email(s)


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/guest/invite
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"chat": "abc123",	"emails": ["guest1@example.com", "guest2@example.com"]}
```



### 3. /team/:id/guest/exists - Check if guest exists


Checks to see if a guest is already registered to a given team.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/:team_id/guest/exists
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



***Body:***

```js        
{	"emails": ["guest1@example.com", "guest2@example.com"]}
```



### 4. /team/:id/guest - Delete guest


Removes a guest and revokes access to any groups or meetings they've joined


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/team/:team_id/guest
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



***Body:***

```js        
{	"chat": "abc123",	"email": "guest1@example.com"}
```



### 5. /guest/join - Join group chat


Allows an invited guest to access the group chat they were invited to using their emailed PIN, while also their personal information like name and password.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/:team_id/guest/join
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



***Body:***

```js        
{	"firstname": "jane",	"lastname": "doe",	"password": "hunter2",	"pin": "1234"}
```



### 6. /guest/join/meeting - Join meeting chat


Allows a guest to access the event/meeting chat they were invited to using the event ID, while also their personal information like name


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/:team_id/guest
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



***Body:***

```js        
{	"firstname": "jane",	"lastname": "doe",	"meeting_id": "abc123",	"pin": "1234"}
```



### 7. /team/:id/guest/:guest_id/upgrade - Upgrade guest to user


Transforms a Guest into a full-fledged user, by setting their role and plan


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/team/:team_id/guest/:user_id/upgrade
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |
| user_id |  |  |



***Body:***

```js        
{	"role": "abc123",	"plan": "abc123"}
```



## Users & Teams/Departments



### 1. /department - Create department


Creates a new Department, which organizes users together into groups


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/department
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"name": "something",	"team": "a5b63640e8d2af8bb894778fa8fdb6794",	"ring_type": "something"}
```



### 2. /department/:dept_id - Update department


Updates a Department's information


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/department/:dept_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| dept_id |  |  |



***Body:***

```js        
{	"name": "something",	"ring_type": "something"}
```



### 3. /department - List departments


Lists all departments visible to the current user


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/department
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 4. /department/:dept_id - Delete department


Delete an individual department by ID


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/department/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 5. /department/:dept_id/users - Add user to Department


Adds a user to a Department


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/department/:dept_id/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| dept_id |  |  |



### 6. /department/:dept_id/users/:id - Remove user from Department


Removes a user from a Department


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/department/:dept_id/users/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| dept_id |  |  |
| id |  |  |



## Users & Teams/Devices



### 1. /user/:user_id/devices - Register device for push


Check to see if an email is already registered as a user.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/user/ac0459ce2fc37de93738b947f120293f8/devices
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"email": "test@example.com"}
```



### 2. /user/:user_id/devices/:registration_id - Remove device registration


Removes a device registration from a user, so that it won't be sent push notifications


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/user/:user_id/devices/:registration_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| user_id |  |  |
| registration_id |  |  |



### 3. /user/:user_id/devices/:registration_id - Update device registration


Edits a device registration for a user, useful for enabling `doNotDisturb`, which will surpress all push notifications for that device without deleting the registration.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/user/:user_id/devices/:registration_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| user_id |  |  |
| registration_id |  |  |



## Users & Teams/User



### 1. /user/me - Get logged-in user profile


Loads all of the profile information and settings related to the currently logged-in user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/user/me
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| populate | teams | Optionally include larger/slower fields |



***Responses:***


Status: Get profile | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 621 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 12 Dec 2017 18:16:16 GMT |
| ETag | W/"26d-fuPYsIY/fMb2TGjYyUVGsg" |
| Server | nginx/1.12.1 |
| X-Powered-By | Sails <sailsjs.org> |
| set-cookie | sails.sid=s%3A8d7KC7aE3TfoPwOBCzFSDMlVG6pLADdw.j0GZPscBsJZMmQxC668zJad2m4pzNOTaNypqFmCahMI; Path=/; HttpOnly |



```js
{    "status": "active",    "extensionSecret": "gwugzq",    "first_name": "Jane",    "last_name": "Doe",    "created_at": "2017-01-19T15:59:53.000Z",    "avatar": "https://path/to/avatar.png",    "tours": [        "group-tour",        "people-tour",        "people-tour",        "calendar-tour-2",        "calendar-tour-2"    ],    "state": "offline",    "color": "f864b1",    "language": "en",    "timezone": "America/Toronto",    "timeformat": "24-hour",    "dateformat": "YYYY-MM-DD",    "tooltips": false,    "teams": [],    "devices": [],    "id": "a9090474a9b626f43d0b42b4cc67d483e",    "email": "user@example.com"}
```



### 2. /user/me - Update logged-in user profile


Loads all of the profile information and settings related to the currently logged-in user.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/user/me
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| populate | teams | Optionally include larger/slower fields |



***Body:***

```js        
{    "status": "active",    "extensionSecret": "vqkpnm",    "first_name": "Matt",    "last_name": "Test",    "created_at": "2017-01-28T18:41:51.000Z",    "avatar": "https://df-stg-assets.s3.amazonaws.com/pickle_rick.jpeg",    "tours": [        "people-tour",        "contact-tour",        "group-tour",        "calendar-tour-1"    ],    "state": "offline",    "color": "87b1c4",    "language": "en",    "timezone": "America/Toronto",    "timeformat": "24-hour",    "dateformat": "YYYY-MM-DD",    "tooltips": false,    "devices": [],    "id": "a8154917fb8693da807a151d5734dc162",    "email": "matt.mollon@gmail.com"}
```



### 3. /user/:user_id - Get user profile


Get the publicly accessible information about a user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/user/a118960aa0b70b1dec0d3d329b8b3b3f1
```



### 4. /user - Create owner


Creates a team owner, which can be used to create a team. To create users, see `POST /team/:id/invite` and `POST /team/:id/add`


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/user
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"first_name": "Jane",	"last_name": "Doe",	"email": "asdf@example.com",	"password": "123456"}
```



***Responses:***


Status: Create user | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 266 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 20:10:00 GMT |
| ETag | W/"10a-MFc0IWB4G0oYj0zEF16BfQ" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{    "status": "active",    "first_name": "Jane",    "last_name": "Doe",    "created_at": "2017-12-14T20:10:00.478Z",    "state": "offline",    "color": "f864b1",    "tooltips": true,    "id": "a5c67ed99c64c94f37f617ae86fbdc47e",    "email": "janedoe@example.com"}
```



### 5. /user/exist - Check if user exists


Check to see if an email is already registered as a user.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/user/exist
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"email": "test@example.com"}
```



***Responses:***


Status: Create user | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 266 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 20:10:00 GMT |
| ETag | W/"10a-MFc0IWB4G0oYj0zEF16BfQ" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{    "status": "active",    "first_name": "Jane",    "last_name": "Doe",    "created_at": "2017-12-14T20:10:00.478Z",    "state": "offline",    "color": "f864b1",    "tooltips": true,    "id": "a5c67ed99c64c94f37f617ae86fbdc47e",    "email": "janedoe@example.com"}
```



### 6. /team/:id/add - Create user


Creates a user on the team, and assigns a password. To allow a user to set their initial password, they must be Invited instead. See `POST /team/:id/invite` and `POST /team/:id/accept` for steps on inviting.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/:id/add
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



***Body:***

```js        
{	"first_name": "Jane",	"last_name": "Doe",	"email": "test@example.com",	"password": "123456"}
```



***Responses:***


Status: Create user | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 266 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 20:10:00 GMT |
| ETag | W/"10a-MFc0IWB4G0oYj0zEF16BfQ" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{    "status": "active",    "first_name": "Jane",    "last_name": "Doe",    "created_at": "2017-12-14T20:10:00.478Z",    "state": "offline",    "color": "f864b1",    "tooltips": true,    "id": "a5c67ed99c64c94f37f617ae86fbdc47e",    "email": "janedoe@example.com"}
```



### 7. /team/:id/invite - Invite user


Adds a one or more users to a team by inviting them, which sends them an email with instructions to complete registration and set password. See [POST /team/:id/accept](#accept-invite) to accept the invite and assign a password, or `POST /team:id/add` to create a user.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/invite
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
[ 	{"email": "user1@example.com"},	{"email": "user2@example.com"}]
```



***Responses:***


Status: Invite user | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 290 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 21 Dec 2017 00:32:03 GMT |
| ETag | W/"122-oM6cyxGgy7eQsjCc9h8t7Q" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
[  {    "email": "user1@example.com",    "token": "a1148c0aa9042e8aaf6a2602bddcb6191",    "user_id": "a15eb284d1bd109d433ec561e1fdd1bad"  },  {    "email": "user2@example.com",    "token": "a580c2507a96f55034cc4c5934b467a5a",    "user_id": "a441cb6f10c694e38a474e1cb5100d241"  }]
```



### 8. /team/:id/accept - Accept invite


Accepts an invite using the invite token sent in the initial email, as well as the missing fields like name and password.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/accept
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"token": "a1148c0aa9042e8aaf6a2602bddcb6191",	"firstname": "jane",	"lastname": "doe",	"password": "123456"}
```



***Responses:***


Status: Accept invite | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 81 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 21 Dec 2017 00:42:32 GMT |
| ETag | W/"51-tyeF0iTJJ8A2DEcvj92GZg" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "team": "a5b63640e8d2af8bb894778fa8fdb6794",  "email": "user1@example.com"}
```



### 9. /team/:id/resendInvite - Resend Invite


Resends the invite email to a pending user


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/resendInvite
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"email": "user@example.com"	}
```



### 10. /team/:id/users/:userId - Deactivate user


Deactivates a user from the team. They will no longer appear on user lists, recieve calls/messages, or count as a billable user. They can be re-activated at any point, without any loss of information.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/team/:id/users/:userid
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |
| userid |  |  |



### 11. /team/:id/users/:userId - Re-activate user


Re-activates a deactivated user on a team. They will once again appear on user lists, recieve messages, and count as a billable user.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/user/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 12. /team/:id/users/:userId - Update User


Re-activates a deactivated user on a team. They will once again appear on user lists, recieve messages, and count as a billable user.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/user/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 13. /user - List all users


Loads a list of all other users that are visible to the logged-in user.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/user
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 14. /team/:id/users/:userId - Update User copy


Re-activates a deactivated user on a team. They will once again appear on user lists, recieve messages, and count as a billable user.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/user/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



## Users & Teams/Team



### 1. /team - Create team


Creates a new team and assigns a Team owner, who will act as the default administrator for the team. The owner can create or invite other admins or users to the team.## Options+ `team_name` - The display name of the team. Team names are unique, consider using `POST /team/exist` to check for existing teams first.+ `owner` - The UserId of the user to be considered the owner of this team. The team owner is automatically assigned the role `admin`. + `country` - The country that the Team is based in. Choice of `country`, `city` and `state` will determine the default timezone, and the phone number chosen for Main Line. (eg, `Canada, Toronto, ON` will mean a Main Number of either `647-xxx-xxxx`, `905-xxx-xxxx`, etc)+ `state` - The State or Province the Team is based in+ `city` - The City that the Team is based in+ `ref` - Optional referral code. See our Partner Program docs (https://uc.debrief.com/lp/partner-program/) for info.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"team_name": "My company name",	"owner": "a8bb5b6b271416a767fd3dd684ad6e5f1",	"country": "Canada",	"city": "Toronto",	"state": "ON",	"ref": "referral_code"}
```



***Responses:***


Status: Create team | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 306 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 19 Dec 2017 21:25:38 GMT |
| ETag | W/"132-8X4qMtKuEYDu78VKI4oyIw" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "team_name": "My company name",  "slug": "my-company-name",  "departments": {},  "billing_id": 297846,  "activated": "pending",  "city": "Toronto",  "country": "Canada",  "state": "ON",  "autoreception": "not-started",  "id": "a1a1b4daad621a1068587ddfc7b483886",  "users": [],  "owner": []}
```



### 2. /team/:id - Update team info


Updates a team's information, like name or address.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/team/a5124f164c0f1715ad05ed2c081f61137
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"team_name": "NativApps",	"slug": "nativapps"}
```



### 3. /team/exist - Check existing


Checks to see if a given team name exists.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team/exist
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{	"team_name": "ACME Co"}
```



***Responses:***


Status: Existing team | Code: 400



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 98 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:23:58 GMT |
| ETag | W/"62-xnd9GAsq8sN9Q9/08+un/g" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "errorType": "validation",  "response": {    "team_name": "Team Name is already taken"  }}
```



Status: Non-existing | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 2 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:24:47 GMT |
| ETag | W/"2-mZFLkyvTelC5g8XnyQrpOw" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{}
```



### 4. /team/:id/users - Get team users


Checks to see if a given team name exists.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Responses:***


Status: Non-existing | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 2 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:24:47 GMT |
| ETag | W/"2-mZFLkyvTelC5g8XnyQrpOw" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{}
```



Status: Existing team | Code: 400



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 98 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:23:58 GMT |
| ETag | W/"62-xnd9GAsq8sN9Q9/08+un/g" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "errorType": "validation",  "response": {    "team_name": "Team Name is already taken"  }}
```



### 5. /team/:id/info - Get team info


Checks to see if a given team name exists.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Responses:***


Status: Non-existing | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 2 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:24:47 GMT |
| ETag | W/"2-mZFLkyvTelC5g8XnyQrpOw" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{}
```



Status: Existing team | Code: 400



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 98 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:23:58 GMT |
| ETag | W/"62-xnd9GAsq8sN9Q9/08+un/g" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "errorType": "validation",  "response": {    "team_name": "Team Name is already taken"  }}
```



### 6. /team/:id/pendingusers - Get team pending users


Checks to see if a given team name exists.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Responses:***


Status: Non-existing | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 2 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:24:47 GMT |
| ETag | W/"2-mZFLkyvTelC5g8XnyQrpOw" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{}
```



Status: Existing team | Code: 400



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 98 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:23:58 GMT |
| ETag | W/"62-xnd9GAsq8sN9Q9/08+un/g" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "errorType": "validation",  "response": {    "team_name": "Team Name is already taken"  }}
```



### 7. /teamuser/:id/ccagentconfig - Get user's CCQueueAgents


Checks to see if a given team name exists.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/a5b63640e8d2af8bb894778fa8fdb6794/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Responses:***


Status: Non-existing | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 2 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:24:47 GMT |
| ETag | W/"2-mZFLkyvTelC5g8XnyQrpOw" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{}
```



Status: Existing team | Code: 400



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 98 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 14 Dec 2017 21:23:58 GMT |
| ETag | W/"62-xnd9GAsq8sN9Q9/08+un/g" |
| Server | nginx/1.12.1 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Sails <sailsjs.org> |



```js
{  "errorType": "validation",  "response": {    "team_name": "Team Name is already taken"  }}
```



***Available Variables:***

| Key | Value | Type |
| --- | ------|-------------|
| username | matt@debrief.com | string |
| password | 123 | string |



---
[Back to top](#debrief-communication-api)
> Made with &#9829; by [thedevsaddam](https://github.com/thedevsaddam) | Generated at: 2020-01-31 00:48:03 by [docgen](https://github.com/thedevsaddam/docgen)
