const
    MESSAGE_MAX_LENGTH = 240,
    USER_MAX_LENGTH = 32,
    CHANNEL_MAX_LENGTH = 32,
    express = require('express'),
    app = express(),
    server = app.listen(9999),
    sio = require("socket.io")(server),
    io = sio.of('/cyberworld');

let
    users = [],
    queryUser = '', queryChannel = '',
    sockets = [];

function logger(msg) {
    console.log((new Date).toLocaleString() + ' :: ' + msg)
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
    queryUser = req.query.user ? req.query.user : '';
    queryUser = queryUser.substring(0, USER_MAX_LENGTH).replace(/ /g, '_');
    queryChannel = req.query.channel ? req.query.channel : 'cyberworld';
    queryChannel = queryChannel.substring(0, CHANNEL_MAX_LENGTH).replace(/ /g, '_');
    res.render('index')
});

function firstInChannel(c) {
    let counter = 0;
    users.forEach(x => { if (x.indexOf(c) === 0) counter++ });
    return counter === 0 ? true : false
}

io.on('connection', socket => {

    socket.mode = '-';

    sockets.push(socket);

    logger(`Client connected [id=${socket.id}]`);

    if (socket.channel === undefined) {
        if (queryChannel.length > 0) {
            socket.channel = queryChannel
        } else {
            socket.channel = 'cyberworld'
        }
    }

    socket.join(socket.channel);

    io.to(socket.channel).emit('get_topic', '');

    socket.on('send_topic', function(data) {
        socket.topic = data.topic;
        if (socket.topic.length > 0) {
            io.to(socket.channel).emit('topic', {topic : socket.topic, username : ':'})
        }
    });

    socket.on('hello', () => {

        if (firstInChannel(socket.channel)) {
            socket.mode = '+';
            console.log('first in channel ' + socket.channel)
        }

        if (socket.username === undefined) {
            if (queryUser.length > 0) { 
                socket.username = socket.channel + '%%%%' + queryUser +
                    '@' + socket.handshake.headers['x-real-ip'] +
                    '%%%%' + socket.mode;
                queryUser = ''
            } else {
                socket.username = socket.channel + '%%%%' +
                    Math.random().toString(36).substring(2, 15) +
                    '@' + socket.handshake.headers['x-real-ip'] +
                    '%%%%' + socket.mode;
            }
            let userExists = false;
            users.forEach(u => {
                if (u.indexOf(socket.username.substring(0, socket.username.length - 1)) === 0) {
                    userExists = true
                }
            });
            if (userExists) {
                logger(`${socket.username} already exists.`);
                socket.username = socket.channel + '%%%%' +
                    Math.random().toString(36).substring(2, 15) +
                    '@' + socket.handshake.headers['x-real-ip'] +
                    '%%%%' + socket.mode;
            } else {
                logger(`connection from: "${socket.username}" to channel "${socket.channel}".`)
            }
        }
        let user = socket.username.split('%%%%')[1];
        socket.emit('confirm_username', { user: user, channel: socket.channel } );
        users.push(socket.username);
        let u = [];
        for (let i=0; i<users.length; i++) {
            if (users[i].indexOf(socket.channel) === 0) {
                u[i] = users[i].split('%%%%')[1];
                if (users[i].split('%%%%')[2] === '+') {
                    u[i] = '@' + u[i]
                }
            }
        }
        io.to(socket.channel).emit('update_userlist', {userlist : u});
        io.to(socket.channel).emit('new_message', {message : user +
            ' connected to channel "' + socket.channel + '"', username : ':'});
        if (socket.channel === 'cyberworld') {
            socket.emit('server_message', {
                message : 'this is the default channel', username : ':'
            });
            socket.emit('server_message', {
                message : 'try http://cheapchat.nl/?user=MyNickName&channel=MyChannel', username : ':'
            })
        }
        logger(users)
    })

    socket.on('disconnect', () => {
        sockets.splice(sockets.indexOf(socket), 1);
        if (socket.username === undefined) {
            logger('Disconnect from undefined: ' + socket.handshake.headers['x-real-ip'])
        } else {
            let user = socket.username.split('%%%%')[1];
            logger('user ' + socket.username + ' disconnected');
            let index = users.indexOf(socket.username);
            if (index > -1) {
                users.splice(index, 1);
                let u = [];
                for (let i=0; i<users.length; i++) {
                    if (users[i].indexOf(socket.channel) === 0) {
                        u[i] = users[i].split('%%%%')[1];
                        if (users[i].split('%%%%')[2] === '+') {
                            u[i] = '@' + u[i]
                        }
                    }
                }
                io.to(socket.channel).emit('update_userlist', {userlist : u});
                io.to(socket.channel).emit('server_message', {message : user +
                    ' disconnected', username : ':'});
            }
        }
    });

    socket.on('change_username', data => {
        if (socket.username === undefined) {
            resetUser()
        }
        let name = data.username
            .replace(/<(?:.|\n)*?>/gm, '')
            .replace(/[&@]/g, '-')
            .substring(0, USER_MAX_LENGTH)
            .replace(/ /g, '_');
        let user = socket.username.split('%%%%')[1];
        let shortUser = user.substring(0, user.lastIndexOf('@'));

        let userExists = false;
        users.forEach(u => {
            if (u.indexOf(socket.username === 0)) {
                userExists = true
            }
        });

        if (userExists) {

            let newUserExists = false;
            users.forEach(u => {
                if (u.indexOf(socket.channel + '%%%%' + name +
                '@' + socket.handshake.headers['x-real-ip']) === 0) {
                    newUserExists = true
                }
            });

            if (newUserExists) {
                logger(`${name} already exists.`);
                socket.emit('confirm_username', { user: user, channel: socket.channel } );
            } else if (name.length < 1) {
                logger('Too small.')
            } else if (name.indexOf(':') > -1) {
                logger('Reserved.')
            } else {
                logger(`user "${user}" → "${name}" (${socket.username})`);
                let index = -1;
                for (i=0; i<users.length; i++) {
                    if (users[i].indexOf(socket.channel + '%%%%' + user) === 0) index = i
                }
                if (index > -1) console.log('ok');
                users[index] = socket.channel + '%%%%' + name +
                    '@' + socket.handshake.headers['x-real-ip'] +
                    '%%%%' + socket.mode
                let u = [];
                for (let i=0; i<users.length; i++) {
                    if (users[i].indexOf(socket.channel) === 0) {
                        u[i] = users[i].split('%%%%')[1];
                        if (users[i].split('%%%%')[2] === '+') {
                            u[i] = '@' + u[i]
                        }
                    }
                }
                io.to(socket.channel).emit('update_userlist', {userlist : u});
                io.to(socket.channel).emit('server_message', {message : shortUser +
                    ' changed name to ' + name, username : ':'});
                socket.username = socket.channel + '%%%%' + name +
                    '@' + socket.handshake.headers['x-real-ip'] +
                    '%%%%' + socket.mode;
                logger(users)
            }
        }
    });

    function resetUser() {
        socket.username = socket.channel + '%%%%' +
            Math.random().toString(36).substring(2, 15) +
            '@' + socket.handshake.headers['x-real-ip'] +
            '%%%%' + socket.mode;
        socket.join(socket.channel);
        let user = socket.username.split('%%%%')[1];
        socket.emit('confirm_username', { user: user, channel: socket.channel } );
        users.push(socket.username);
        let u = [];
        for (let i=0; i<users.length; i++) {
            if (users[i].indexOf(socket.channel) === 0) {
                u[i] = users[i].split('%%%%')[1];
                if (users[i].split('%%%%')[2] === '+') {
                    u[i] = '@' + u[i]
                }
            }
        }
        io.to(socket.channel).emit('update_userlist', {userlist : u});
        io.to(socket.channel).emit('server_message', {message : user +
            ' connected to channel "' + socket.channel + '"', username : ':'});
        logger('resetUser: ' + socket.handshake.headers['x-real-ip']);
        logger(users)
    }

    socket.on('new_message', data => {
        if (socket.username === undefined) {
            logger('Sending message from undefined@' +
                socket.handshake.headers['x-real-ip'] + ' in channel ' + socket.channel);
            resetUser()
        }
        let message = data.message;
        let user = socket.username.split('%%%%')[1];
        let shortUser = user.substring(0, user.lastIndexOf('@'));
        message = message.replace(/<(?:.|\n)*?>/gm, '').trim();
        if (message === '') return false;
        if (message[0] === '/') {
            logger('command: ' + message);
            let commands = message.split(' ');
            commands[0] = commands[0].toUpperCase();
            if (commands[0] === '/LOL') {
                io.to(socket.channel).emit('new_message', {message : 'hahaha', username : shortUser});
            }
            if (commands.length > 1) {
                if (commands[0] === '/ME') {
                    io.to(socket.channel).emit('bold_message',
                     {message : shortUser + ' ' + message.substring(4), username : ':'});
                }
                if (commands[0] === '/TOPIC') {
                    socket.topic = message.substring(7);
                    io.to(socket.channel).emit('topic', {topic : socket.topic, username : ':'});
                    io.to(socket.channel).emit('server_message',
                     {message : shortUser + ' changed topic to "' + socket.topic + '"', username : ':'});
                }
                if (commands[0] === '/MSG') {
                    let msgUser = commands[1];
                    let msg = message.substring(message.indexOf(msgUser) + msgUser.length + 1);
                    sockets.forEach(s => {
                        if (typeof s.username !== "undefined")
                            if (s.username.indexOf(socket.channel + '%%%%' + msgUser + '@') === 0) {
                                s.emit('bold_message', {message: 'message from ' +
                                    shortUser + ': ' + msg, username: ':'});
                                socket.emit('bold_message', {message: 'message to ' +
                                msgUser + ': ' + msg, username: ':'});
                                logger('message "' + msg + '" to ' + s.username)
                            }
                    })
                }
                if (commands[0] === '/OP') {
                    if (socket.mode === '+') {
                        let opUser = commands[1];
                        for (i=0; i<users.length; i++) {
                            if (users[i].indexOf(socket.channel + '%%%%' + opUser) === 0) {
                                logger(shortUser + ' ops ' + opUser);
                                users[i] = users[i].substring(0, users[i].length - 1) + '+';
                                console.log(users[i][users[i].length - 1])
                                io.to(socket.channel).emit('server_message',
                                    {message : shortUser + ' gives operator status to ' +
                                    opUser, username : ':'});
                                let u = [];
                                for (let i=0; i<users.length; i++) {
                                    if (users[i].indexOf(socket.channel) === 0) {
                                        u[i] = users[i].split('%%%%')[1];
                                        if (users[i].split('%%%%')[2] === '+') {
                                            u[i] = '@' + u[i]
                                        }
                                    }
                                }
                                io.to(socket.channel).emit('update_userlist', {userlist : u});
                                sockets.forEach(s => {
                                    if (typeof s.username !== "undefined")
                                        if (s.username.indexOf(socket.channel + '%%%%' + opUser + '@') === 0) {
                                            s.mode = '+';
                                        }
                                })            
                            } 
                        }
                        console.log(users)
                    } else {
                        logger('Wrong mode!! '+ socket.username)
                    }
                }
            }
        } else {
            if (message.length > MESSAGE_MAX_LENGTH) {
                message = message.substring(0, MESSAGE_MAX_LENGTH) + '... &larr; TRUNCATED'
            }
            io.to(socket.channel).emit('new_message', {message : message, username : shortUser});
        }
    });

    socket.on('typing', () => {
        if (socket.username === undefined) {
            logger('"typing" to undefined in channel ' + socket.channel);
            resetUser()
        }
        let user = socket.username.split('%%%%')[1];
        socket.broadcast.to(socket.channel).emit('typing', {username : user})
    })

});

logger('Server listening at TCP port 9999');
