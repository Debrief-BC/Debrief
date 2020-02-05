Vue.use(VueResource);
new Vue({
    el: '#app',
    data: () => {
        
        io.sails.transports = ['websocket']

        io.socket.on('chat', function (socketdata) {
            console.log('chat data', socketdata);
            if (socketdata.verb === 'addedTo') {
                switch (socketdata.attribute) {
                    case 'messages':
                        data.chats[socketdata.id].unread++;
                        if (data.chats[socketdata.id].messages) {
                            data.chats[socketdata.id].messages.push(socketdata.added);
                        }
                        break;
                }
            }
        });

        io.socket.on('user', function (socketdata) {
            console.log('user data', socketdata);
            if (socketdata.verb === 'addedTo') {
                switch (socketdata.attribute) {
                    case 'chats':
                        let chat = {};
                        Object.assign(chat, socketdata.added);
                        chat.unread = 0;
                        Vue.set(data.chats, chat.id, chat);
                        break;
                }
            }
        });
        let data = {
            currentUser: null,
            client_id: 'iK47SrFTlJ',
            client_secret: '$2y$10$J.cy2UbfsZNhDNIpwrcBgeK6iaAUJqfkA',
            email: '',
            password: '',
            auth_token: '',
            users: [],
            chats: {},
            activeChat: null,
            setActiveChat: function (chat) {
                data.activeChat = chat;
                this.$http.get('/chat/' + chat.id + '/messages').then(function (response) {
                    console.log(response.data);
                    Vue.set(data.activeChat, 'messages', response.data);
                }).catch(console.error);
            },
            name: function (user) {
                if (user.first_name || user.last_name) {
                    return user.first_name + " " + user.last_name;
                } else {
                    return user.email;
                }
            },
            processBody: function (message) {
                return JSON.stringify(message);
            },
            login: function () {
                const http = this.$http;
                
                let loginData = {
                    'grant_type': 'password',
                    'username': data.email,
                    'password': data.password,
                    'client_id': data.client_id,
                    'client_secret': data.client_secret
                }
                
                http.post('http://michael/v1/login-user', loginData)
                .then((response) => {
                    console.log('auth_data', response.data)
                    window.localStorage.setItem('auth_data', JSON.stringify(response.data))
                    data.auth_token = response.data.access_token
                    
                    Vue.http.headers.common['Authorization'] = 'Bearer ' + response.data.access_token
                    
                    io.socket.post('/socket/register?pid=' + data.pid, function (resData, jwres) {
                    console.log(resData);

                    io.socket.get('/user/' + data.pid + "?populate=teams,chats&subscribe=teams,chats", function (response, jwres) {
                        console.log('user RESPONSE', response)
                            data.currentUser = response;
                            console.log(response);
                            http.get('/user').then(function (resp) {
                                var users = {};
                                resp.data.forEach(function (user) {
                                    users[user.id] = user;
                                });
                                data.users = users;
                            }).catch(function (err) {
                                console.error(err);
                            });
                            io.socket.get('/chat?populate=users&subscribe=users,messages', function (resData, jwres) {
                                for (var chatdata of resData) {
                                    chatdata.unread = 0;
                                    Vue.set(data.chats, chatdata.id, chatdata);
                                }
                            })
                        });
                    });
                    
                });
            }
        };
        
        if (window.localStorage.getItem('auth_data')) {
            const token = window.localStorage.getItem('auth_data');
            let currentToken = JSON.parse(token)
            
            console.log('token', currentToken)
            
            if (token)
                data.auth_token = currentToken.access_token
        }
        
        return data;
    }
});