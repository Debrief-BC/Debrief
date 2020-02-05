Vue.use(VueResource);
new Vue({
    el: '#app',
    data: () => {
        let sipUser = null;
        let data = {
            ua: { username: '', team: null, secret: '' },
            freeswitch_uri: window.location.hostname + ':7443',
            session: null,
            called_number: "",
            waiting_session: null,
            setUser: function () {
                let team = "global.debrief.com";
                let username = data.ua.username;
                let secret = data.ua.secret;
                let ua = {
                    uri: username + "@" + team,
                    wsServers: ["wss://" + data.freeswitch_uri],
                    authorizationUser: '',
                    password: secret
                };
                window.localStorage.setItem('ua', JSON.stringify(data.ua));
                window.localStorage.setItem('freeswitch_uri', data.freeswitch_uri);
                sipUser = new SIP.UA(ua);
                sipUser.on('invite', function (session) {
                    data.waiting_session = session;
                    session.on('terminated', function (message, cause) {
                        data.waiting_session = null;
                    });
                });
            },
            accept: function () {
                data.session = data.waiting_session;
                data.waiting_session = null;
                data.session.on('terminated', function (message, cause) {
                        data.session = null;
                    });
                data.session.accept({
                    media: {
                        render: {
                            remote: document.getElementById('remoteVideo'),
                            local: document.getElementById('localVideo')
                        }
                    }
                });
            },
            call: function (number) {
                var opts = {
                    media: {
                        constraints: {
                            audio: true,
                            video: false
                        },
                        render: {
                            remote: document.getElementById('remoteVideo'),
                            local: document.getElementById('localVideo')
                        }
                    },
                    extraHeaders: [
                        "X-Team: " + data.ua.team
                    ]
                };
                data.session = sipUser.invite(number, opts);
                data.session.on('terminated', function (message, cause) {
                        data.session = null;
                    });
            },
            endcall: function () {
                data.session.bye();
                data.session = null;
            }
        };
        if (window.localStorage.getItem('ua')) {
            data.ua = JSON.parse(window.localStorage.getItem('ua'));
            data.setUser();

        }
        return data;
    }
});