
# Debrief Management API

The Debrief Management API powers the [Developer Portal](https://portal.debrief.com), and allows developers to register and manage applications that use the Debrief Communication API. The Management API is a good choice for programatically managing apps, but for a more user-friendly interface to simply manage developers and applications, the Developer Portal is recommended.

For how to use these endpoints, see [_Managing Applications_](./managing-applications).

## Indices

* [Authentication](#authentication)

  * [/login - Login](#1-login---login)
  * [/forgot-password - Forgot password](#2-forgot-password---forgot-password)
  * [/reset-password - Reset password](#3-reset-password---reset-password)
  * [/change-password - Change password](#4-change-password---change-password)
  * [/logout - Logout](#5-logout---logout)
  * [/client - Generate client credentials](#6-client---generate-client-credentials)
  * [/login - Login Copy](#7-login---login-copy)

* [Teams](#teams)

  * [/team - Get team](#1-team---get-team)
  * [/team/:id - Get individual team](#2-team:id---get-individual-team)
  * [/team - Create team](#3-team---create-team)
  * [/team-exists - Check team exists](#4-team-exists---check-team-exists)
  * [/team/:id - Update team](#5-team:id---update-team)
  * [/team/:id/add - Add User](#6-team:idadd---add-user)
  * [/team/:team_id/add/:user_id - Remove User](#7-team:team_idadd:user_id---remove-user)

* [Users](#users)

  * [/invite/:token/accept - Accept invite](#1-invite:tokenaccept---accept-invite)
  * [/invite/:token/cancel - Cancel invite](#2-invite:tokencancel---cancel-invite)
  * [/resend-email - Re-send user invite](#3-resend-email---re-send-user-invite)
  * [/user-exists - Check user exists](#4-user-exists---check-user-exists)
  * [/oauth/token - Exchange refresh token](#5-oauthtoken---exchange-refresh-token)
  * [/user - Get user list](#6-user---get-user-list)
  * [/user/me - Get current user](#7-userme---get-current-user)
  * [/user/:user_id/applications - List user's applications](#8-user:user_idapplications---list-user's-applications)
  * [/user/:id - Update user](#9-user:id---update-user)

* [Applications](#applications)

  * [/application - Get Application list](#1-application---get-application-list)
  * [/application/:id - Get Application](#2-application:id---get-application)
  * [/application - Create application](#3-application---create-application)
  * [/application/:id - Update Application](#4-application:id---update-application)
  * [/application/:id - Delete Application](#5-application:id---delete-application)

* [Dashboard](#dashboard)

  * [/dashboard - Get Dashboard](#1-dashboard---get-dashboard)

* [Billing](#billing)

  * [/team/:team_id/billing/upcoming - Get upcoming invoice](#1-team:team_idbillingupcoming---get-upcoming-invoice)
  * [/billing/invoice - Get all invoices](#2-billinginvoice---get-all-invoices)
  * [/billing/invoice/:id - Get one invoice](#3-billinginvoice:id---get-one-invoice)
  * [/billing/methods - Create billing method](#4-billingmethods---create-billing-method)
  * [/billing/methods/:id - Delete billing method](#5-billingmethods:id---delete-billing-method)
  * [/billing/methods - Get billing methods](#6-billingmethods---get-billing-methods)

* [Monitoring](#monitoring)

  * [/team/:id/monitoring - Get Team monitors](#1-team:idmonitoring---get-team-monitors)
  * [/application/:id/monitoring - Get Application monitors](#2-application:idmonitoring---get-application-monitors)

* [Applications/Application Users](#applicationsapplication-users)

  * [/application/:app_id/users/:user_id - Add user to app](#1-application:app_idusers:user_id---add-user-to-app)
  * [/application/:id/users - Get all application users](#2-application:idusers---get-all-application-users)
  * [/application/:app_id/users/:user_id - Update application user](#3-application:app_idusers:user_id---update-application-user)
  * [/application/:id/users/:user_id - Remove application user](#4-application:idusers:user_id---remove-application-user)

* [Applications/Credentials](#applicationscredentials)

  * [/application/:id/creds - Generate credentials](#1-application:idcreds---generate-credentials)
  * [/application/:id/creds - Get all credentials](#2-application:idcreds---get-all-credentials)
  * [/application/:app_id/creds/:creds_id - Get individual credentials](#3-application:app_idcreds:creds_id---get-individual-credentials)
  * [/application/:id/creds - Update credentials](#4-application:idcreds---update-credentials)
  * [/application/:app_id/creds/:creds_id - Delete credentials](#5-application:app_idcreds:creds_id---delete-credentials)


--------


## Authentication
The Communication API and the Management API use different authentication systems, to keep the users who are administrating/developing applications isolated from the users and teams on the Communication API itself. This separation allows developers to use one set of client credentials to test many different Communication API Users across multiple Teams. 

Where Communication API users are able to have functionality such as real-time chat, Management users only control information about client applications such as credentials or metadata.



### 1. /login - Login


Logs-in a user by sending their credentials along with Mananagement API _client credentials_. Successful logins will return an _access_ token and _refresh_ token. Similar to the main UCaaS API, the access token must be sent with future requests as a bearer token.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/login
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
  "grant_type": "password",
  "username": "{{loginUser}}",
  "password": "{{loginPassword}}",
  "client_id": "{{clientId}}",
  "client_secret": "{{clientSecret}}"
}
```



***Responses:***


Status: Login | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 138 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 10 Sep 2018 15:31:57 GMT |
| ETag | W/"8a-sjQHW2okrl4Y87VcZy2NTA" |
| Vary | X-HTTP-Method-Override, Accept-Encoding |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{
    "expires_in": "3600",
    "refresh_token": "GJF4NCZLm4DQNZzLTLIuLUi...",
    "access_token": "igOv9fOJPt3bCAdWkaRFs7M..."
}
```



### 2. /forgot-password - Forgot password


Inititates a password reset request based on a user's email. If the email address is found, it will generate and return a single-use _reset token_ which is only used to complete the password reset at `POST /reset-password`.

The user will also be emailed a link to the Password Reset page on the Developer Portal, so the user can complete the password reset in their browser.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/forgot-password
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"email": "example.user@example.com"
}
```



***Responses:***


Status: Successful password forgot | Code: 500



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 2712 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 15:07:58 GMT |
| ETag | W/"a98-nd4PSWLLVnFp+oB3VPzM0A" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{
	"email": "test+user@gmail.com",
	"token": "aKHZZQ4K9sqRxjIiJerNuZcnKCB9xwlF8jZS2XXHKCVYgZwbZhiHARxZwhsbDpQn"
}
```



### 3. /reset-password - Reset password


Completes a password reset by accepting a new password and the _reset token_ generated by the `POST /forgot-password` endpoint.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/reset-password
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"token": "aKHZZQ4K9sqRxjIiJerNuZcnKCB9xwlF8jZS2XXHKCVYgZwbZhiHARxZwhsbDpQn",
	"password": "12345678"
}
```



***Responses:***


Status: Password reset | Code: 500



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 295 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 15:10:06 GMT |
| ETag | W/"127-OSL+JFBagMsKSn/A/PT9aA" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{
	"status": "Successfully reset password"
}

```



### 4. /change-password - Change password


Completes a password reset by taking a new password with the reset token


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/change-password
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"old_password": "12345678",
	"new_password": "123456789"
}
```



### 5. /logout - Logout


Logs-out the current user and invalidates their token


***Endpoint:***

```bash
Method: POST
Type: 
URL: {{apiBasepath}}/logout
```



### 6. /client - Generate client credentials


Generates client credentials (`client_id` and `client_secret`) for the Management API, so client applications can authenticate with the API. Note that this doesn't create client credentials for the Communication API, those can be created through the `POST /application:id/creds` endpoint.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/client
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"name": "my-app-name",
	"redirectURI": "http://debrief.com",
	"trusted": true
}
```



### 7. /login - Login Copy


Logs-in a user by sending their credentials along with Mananagement API _client credentials_. Successful logins will return an _access_ token and _refresh_ token. Similar to the main UCaaS API, the access token must be sent with future requests as a bearer token.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/login
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
  "grant_type": "password",
  "username": "{{loginUser}}",
  "password": "{{loginPassword}}",
  "client_id": "{{clientId}}",
  "client_secret": "{{clientSecret}}"
}
```



***Responses:***


Status: Login | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 138 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 10 Sep 2018 15:31:57 GMT |
| ETag | W/"8a-sjQHW2okrl4Y87VcZy2NTA" |
| Vary | X-HTTP-Method-Override, Accept-Encoding |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{
    "expires_in": "3600",
    "refresh_token": "GJF4NCZLm4DQNZzLTLIuLUi...",
    "access_token": "igOv9fOJPt3bCAdWkaRFs7M..."
}
```



## Teams



### 1. /team - Get team


Gets the information about the current team


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/123
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



### 2. /team/:id - Get individual team


Gets the information about a given team, using its ID.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 3. /team - Create team


Creates a Management API team and the Owner, who will act as the first administrator.


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
{
	"team_name": "Test team",
	"email": "{{loginUser}}",
	"password": "{{loginPassword}}",
	"first_name": "Mm",
	"last_name": "Mo"
}
```



***Responses:***


Status: Existing team | Code: 500



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 119 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 15:20:46 GMT |
| ETag | W/"77-K9tlXP2cuWLOLpoicFAiCQ" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{"errorType":"validation","response":{"team_name":"Team with this name already exist. Please choose a different name"}}
```



Status: Create team | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 63 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 15:20:24 GMT |
| ETag | W/"3f-boUzjTNhsraVIz9B72oWTA" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{"id":"5b8ea2b80c984e5a140c28ad","team_name":"My Example Team"}
```



### 4. /team-exists - Check team exists


Checks to see if a team name has been taken, since team names are unique


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/team-exists
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"team": "My example team"
}
```



***Responses:***


Status: Team exists | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 20 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 06 Sep 2018 16:56:58 GMT |
| ETag | W/"14-PHiq0Co2Ed+ppuCGegTaYQ" |
| Server | nginx/1.12.2 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{
  "exists": true
}
```



Status: Team doesn't exist | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 21 |
| Content-Type | application/json; charset=utf-8 |
| Date | Thu, 06 Sep 2018 16:57:21 GMT |
| ETag | W/"15-7bU9VFyfVt86oLh6U0y2Vg" |
| Server | nginx/1.12.2 |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{
  "exists": false
}
```



### 5. /team/:id - Update team


Updates a team's editable fields; team `id` and `email` are read-only once created, but a team `name` can be modified.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/team/:id
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
{
	"name": "asdf team",
	"email": "user@example.com",
	"password": "12345678"
}
```



### 6. /team/:id/add - Add User


Adds a user to the team, either by inviting them or by creating them. To **create** a user, make sure the request has a `password` field. To **invite** a user, simply remove the `password` field, and the API will treat this creation as in invite


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
{
	"first_name": "Jane",
	"last_name": "Doe",
	"email": "testuser1@example.com",
	"password": "12345678",
	"role": "admin"
}
```



### 7. /team/:team_id/add/:user_id - Remove User


Deletes a user from a team


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/team/:team_id/user/:user_id
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



## Users



### 1. /invite/:token/accept - Accept invite


Allows a user to accept an invitation to a team by exchanging an invite token for a password. Successful requests will make the user account active, allowing them to login.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/invite/:token/accept
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| token |  |  |



***Body:***

```js        
{
	"password": "Password1"
}
```



### 2. /invite/:token/cancel - Cancel invite


Cancels a user invite, and invalidates the invite token


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/invite/:token/accept
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| token |  |  |



### 3. /resend-email - Re-send user invite


Re-sends a user their confirmation email


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/resend-email
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"email": "user@example.com"
}
```



### 4. /user-exists - Check user exists


Validates if a given Management API user exists using their email address.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/user-exists
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"email": "user@example.com"	
}
```



***Responses:***


Status: User doesn't exist | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 16 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 03 Sep 2018 17:44:51 GMT |
| ETag | W/"10-EkxYknxFpUV1bncDVlJsvg" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{"exists":false}
```



Status: User exists | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 15 |
| Content-Type | application/json; charset=utf-8 |
| Date | Mon, 03 Sep 2018 17:44:20 GMT |
| ETag | W/"f-+zjEWOAPYIestsWnAt4+zQ" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |
| set-cookie | sails.sid=s%3Aezh2tVv_b_c2gmvyTtCWCyRRNN13pnWt.5uRi0WFZCVRDgXFMDkf4ieLhBvCpJaD3fNBumgwUB6o; Path=/; HttpOnly |



```js
{"exists":true}
```



### 5. /oauth/token - Exchange refresh token


Exchanges a user's refresh token for a new access token


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/oauth/token
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"client_id": "{{clientId}}",
	"client_secret": "{{clientSecret}}",
	"refresh_token": "abc123"
}
```



### 6. /user - Get user list


Retrieves a list of of all users visible to the current user


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



### 7. /user/me - Get current user


Retrieves a list of of all users visible to the current user


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



### 8. /user/:user_id/applications - List user's applications


Lists all the applications a given user is on.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/user/:user_id/applications
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| user_id |  |  |



### 9. /user/:id - Update user


Updates the information about an individual user


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



***Body:***

```js        
{
	"avatar": "some_image_file.jpg",
	"first_name": "Lauren",
	"last_name": "Ipsum",
	"role": "admin",
	"bio": "I do things",
	"password": "1234567"
}
```



## Applications



### 1. /application - Get Application list


Loads a list of all applications that the current user has permissions to see.

If a user has the `role` of `admin` or `owner`, then this will be all applications on the team. If the user has the role of `developer`, then only the applications they've manually been added to will be visible.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/application
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Responses:***


Status: Application list | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 18168 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 17:20:30 GMT |
| ETag | W/"46f8-VTv1gy+zqylW/Tijqjy75Q" |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
[
    {
        "id": "5b8e877f0c984e5a140c2873",
        "name": "vasdfasdf",
        "description": "asdfasdf"
    },
    {
        "id": "5b8e91890c984e5a140c289e",
        "name": "fgsdf",
        "description": "asdfasdf"
    },
    {
        "id": "5b8e918e0c984e5a140c289f",
        "name": "asdfasdfas",
        "description": "fasdfasdf"
    },
    {
        "id": "5b8e91fc0c984e5a140c28a4",
        "name": "test 1",
        "description": "test test test "
    },
    {
        "id": "5b8e922a0c984e5a140c28a5",
        "name": "test 2",
        "description": "test test "
    },
    {
        "id": "5b8e9d370c984e5a140c28a8",
        "name": "test 6 - long description ",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Justo laoreet sit amet cursus sit amet dictum sit amet. Libero justo laoreet sit amet cursus sit amet dictum sit. Tristique nulla aliquet enim tortor at."
    },
    {
        "id": "5b8e9d5c0c984e5a140c28a9",
        "name": "test 7 - long description",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Justo laoreet sit amet cursus sit amet dictum sit amet. Libero justo laoreet sit amet cursus sit amet dictum sit. Tristique nulla aliquet enim tortor at. Tortor aliquam nulla facilisi cras fermentum odio eu feugiat pretium. Purus in mollis nunc sed id semper risus in hendrerit."
    }
]
```



### 2. /application/:id - Get Application


Loads information about an individual application


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/application/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



***Responses:***


Status: Get Application | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 81 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 17:20:59 GMT |
| ETag | W/"51-dW0uJpy0jjHctxqd/RBWXg" |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{"id":"5b8e91fc0c984e5a140c28a4","name":"test 1","description":"test test test "}
```



### 3. /application - Create application


Creates an application on the user's current Team.

All apps require a `name`, `description` and `icon` for identification purposes.

Successfully created applications will return with an `id`, which is used to identify the app in other requests.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/application
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"name": "test app",
	"description": "checking for creds",
	"icon": "your_icon.jpg"
}
```



***Responses:***


Status: Create application | Code: 201



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 72 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 17:22:06 GMT |
| ETag | W/"48-FLMWZyPqY+/QCupa5WELdQ" |
| Vary | X-HTTP-Method-Override |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{"id":"5b8ebf3e0c984e5a140c28ef","name":"asdf app","description":"asdf"}
```



### 4. /application/:id - Update Application


Updates the information about an Application.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/application/:id
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
{
	"name": "asdf app",
	"description": "asdf",
	"icon": "your_icon.jpg"
}
```



***Responses:***


Status: Update Application | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 74 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 17:23:22 GMT |
| ETag | W/"4a-GzDcjwOQ0VVB5YUUngsI7w" |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
[{"id":"5b8ebf3e0c984e5a140c28ef","name":"asdf app","description":"asdf"}]
```



### 5. /application/:id - Delete Application


Removes an application from the team.

NB: All users on the team will no longer be able see this app in GET requests, and all associated credentials will stop working immediately. Deleting applications is permanent.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/application/:id
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
{
	"name": "asdf app",
	"description": "asdf",
	"icon": "your_icon.jpg"
}
```



***Responses:***


Status: Delete Application | Code: 200



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 15 |
| Content-Type | application/json; charset=utf-8 |
| Date | Tue, 04 Sep 2018 17:24:02 GMT |
| ETag | W/"f-DwR5h0v29KcoEJmxXfJ8Jw" |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



```js
{"status":"ok"}
```



## Dashboard



### 1. /dashboard - Get Dashboard


Loads all the Dashboard information for the current team, based on the user's token.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/dashboard
```



## Billing



### 1. /team/:team_id/billing/upcoming - Get upcoming invoice


Loads the invoice for the current month based on the most recent activity. Upcoming invoices cannot be paid in advance, when an invoice's period has ended it's automatically billed to the team's default payment method. 


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/:team_id/billing/upcoming
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id | 5b98189a1725300bf36e34fc |  |



### 2. /billing/invoice - Get all invoices


Loads the invoice for the current month based on the most recent activity. Upcoming invoices cannot be paid in advance, when an invoice's period has ended it's automatically billed to the team's default payment method. 


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/billing/invoice
```



### 3. /billing/invoice/:id - Get one invoice


Loads the invoice for the current month based on the most recent activity. Upcoming invoices cannot be paid in advance, when an invoice's period has ended it's automatically billed to the team's default payment method. 


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/billing/invoice/:id
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 4. /billing/methods - Create billing method


Loads the invoice for the current month based on the most recent activity. Upcoming invoices cannot be paid in advance, when an invoice's period has ended it's automatically billed to the team's default payment method. 


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/billing/methods
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
	"token": "asdf"
}
```



### 5. /billing/methods/:id - Delete billing method


Loads the invoice for the current month based on the most recent activity. Upcoming invoices cannot be paid in advance, when an invoice's period has ended it's automatically billed to the team's default payment method. 


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/billing/methods/:id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 6. /billing/methods - Get billing methods


Loads the invoice for the current month based on the most recent activity. Upcoming invoices cannot be paid in advance, when an invoice's period has ended it's automatically billed to the team's default payment method. 


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/billing/methods
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



## Monitoring



### 1. /team/:id/monitoring - Get Team monitors



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/team/:team_id/monitoring
```



***Query params:***

| Key | Value | Description |
| --- | ------|-------------|
| start |  | Start date of monitoring data to load in the format `mm/dd/yyyy` |
| end |  | End date of monitoring data to load in the format `mm/dd/yyyy` |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| team_id |  |  |



### 2. /application/:id/monitoring - Get Application monitors



***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/application/:app_id/monitoring
```



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| app_id |  | The ID of the application to load monitor data for  |



## Applications/Application Users



### 1. /application/:app_id/users/:user_id - Add user to app


Adds a user to an application at a given `role` (options are `admin` or `developer`)


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/application/:app_id/user
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| app_id |  |  |



***Body:***

```js        
{
	"role": "admin|developer"
}
```



### 2. /application/:id/users - Get all application users


Lists all users that are added to this application.

NOTE: This will only list users that are manually added to the app. Team admins have access to all applications and won't be listed here.


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/application/:id/users
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |



### 3. /application/:app_id/users/:user_id - Update application user


Updates a user's `role` on an application, all other fields are read-only


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/application/:id/users/:user_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |
| user_id |  |  |



***Body:***

```js        
{
	"role": "admin|developer"
}
```



### 4. /application/:id/users/:user_id - Remove application user


Removes a user from an application. The user being removed, the application, and any credentials are left untouched.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/application/:id/users/:user_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |
| user_id |  |  |



## Applications/Credentials



### 1. /application/:id/creds - Generate credentials


Generates a set of client credentials for the UCaaS API with randomized `client_id` and `client_secret`.

All credentials require an `environment` of either `sandbox` or `production`.


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{apiBasepath}}/application/:id/creds
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
{
	"label": "test name2",
	"environment": "production"
}
```



### 2. /application/:id/creds - Get all credentials


Retrieves a list of all the credentials for a given application


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/application/:app_id/creds
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| app_id |  |  |



***Responses:***


Status: Get application credentials | Code: 404



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 0 |
| Date | Tue, 04 Sep 2018 16:39:22 GMT |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



### 3. /application/:app_id/creds/:creds_id - Get individual credentials


Retrieves a list of all the credentials for a given application


***Endpoint:***

```bash
Method: GET
Type: RAW
URL: {{apiBasepath}}/application/:app_id/creds/:creds_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| app_id | {{$timestamp}} | This is the ID of the blah blah blah |
| creds_id | abcd | This is something else!  |



***Responses:***


Status: Get application credentials | Code: 404



***Response Headers:***

| Key | Value |
| --- | ------|
| Connection | keep-alive |
| Content-Length | 0 |
| Date | Tue, 04 Sep 2018 16:39:22 GMT |
| X-Powered-By | Debrief Developer <https://developers.debrief.com> |



### 4. /application/:id/creds - Update credentials


Updates a set of credentials' editable fields; most fields are read-only once created, but `label` can be modified.


***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: {{apiBasepath}}/application/:id/creds
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
{
	"label": "new name"
}
```



### 5. /application/:app_id/creds/:creds_id - Delete credentials


Deletes a set of credentials.

NB: When credentials are deleted, they will stop working immediately and any clients using them will no longer be able to authenticate.


***Endpoint:***

```bash
Method: DELETE
Type: RAW
URL: {{apiBasepath}}/application/:id/creds/:creds_id
```


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***URL variables:***

| Key | Value | Description |
| --- | ------|-------------|
| id |  |  |
| creds_id |  |  |



---
[Back to top](#debrief-management-api)
> Made with &#9829; by [thedevsaddam](https://github.com/thedevsaddam) | Generated at: 2020-01-31 00:38:57 by [docgen](https://github.com/thedevsaddam/docgen)
