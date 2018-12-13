const
    HAL = 'hal',
    fs = require('fs'),
    socketBase = 'cheapchat',
    MESSAGE_MAX_LENGTH = 240,
    USER_MAX_LENGTH = 32,
    CHANNEL_MAX_LENGTH = 32,
    TOPIC_MAX_LENGTH = 100,
    Parser = require('expr-eval').Parser,
    express = require('express'),
    app = express(),
    server = app.listen(9999),
    sio = require("socket.io")(server),
    io = sio.of(socketBase);

let
    users = [
        'cheapchat%%%%' + HAL + '@217.169.226.66%%%%+'
    ],
    banned = [],
    queryUser = '',
    queryChannel = '',
    sockets = [],
    operKey = '';

fs.readFile('operkey', 'utf8', (err, data) => {
    if (err) throw err;
    operKey = data;
});

function logger(msg) {
    console.log((new Date).toLocaleString() + ' :: ' + msg)
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
    queryUser = req.query.user ? req.query.user : '';
    queryUser = queryUser.substring(0, USER_MAX_LENGTH).replace(/ /g, '_');
    queryChannel = req.query.channel ? req.query.channel : socketBase;
    queryChannel = queryChannel.substring(0, CHANNEL_MAX_LENGTH).replace(/ /g, '_');
    res.render('index')
});
app.get('*', (req, res) => {
    const url = req.url.split('/');
    let u;
    if (url.length === 2) {
        u = '/?channel=' + url[1] + 
            '&user=' + Math.random().toString(36).substring(2, 15);
    }
    if (url.length > 2) {
        u = '/?channel=' + url[1] + '&user=' + url[2]
    }
    console.log(url);
    res.redirect(u)
});

function firstInChannel(c) {
    let counter = 0;
    users.forEach(x => { if (x.indexOf(c) === 0) counter++ });
    return counter === 0 ? true : false
}

function userExists(userList, user) {
    let exist = false;
    userList.forEach(u => {
        let s = u.split('%%%%')[1];
        s = s.substring(0, s.lastIndexOf('@'));
        if (s === user) exist = true;
    });
    return exist
}

io.on('connection', socket => {
    socket.mode = '-';
    sockets.push(socket);
    logger(`Client connected [id=${socket.id}]`);
    if (socket.channel === undefined) {
        if (queryChannel.length > 0) {
            socket.channel = queryChannel
        } else {
            socket.channel = socketBase
        }
    }
    if (banned.indexOf(socket.handshake.headers['x-real-ip'] + '@' + socket.channel) === 0) {
        logger('BANNED: ' + socket.handshake.headers['x-real-ip'] + '@' + socket.channel);
        return
    }
    socket.join(socket.channel);
    io.to(socket.channel).emit('get_topic', '');
    socket.on('send_topic', function(data) {
        socket.topic = data.topic;
        if (socket.topic.length > 0) {
            io.to(socket.channel).emit('topic', {topic : socket.topic, username : ':'})
        }
    });

    function initUser() {

        if (firstInChannel(socket.channel)) {
            socket.mode = '+';
            logger('first in channel ' + socket.channel)
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
            let user = socket.username.split('%%%%')[1];
            let shortUser = user.substring(0, user.lastIndexOf('@'));
            if (userExists(users, shortUser)) {
                logger(`${shortUser} already exists.`);
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

        socket.emit('server_message',
            {
                message : 'cheapchat 0.2-beta (stuff will break)',
                username : ':'
            });

        io.to(socket.channel).emit('new_message', {message : user +
            ' connected to channel "' + socket.channel + '"', username : ':'});
        if (socket.channel === socketBase) {
            socket.emit('server_message',
            {
                message : 'this is the default channel',
                username : ':'
            });
            socket.emit('server_message',
            {
                message : 'try /help',
                username : ':'
            })
        }
        logger(users)
    }

    socket.on('hello', () => {
        initUser()
    });

    socket.on('send_file_request', data => {
        if (socket.mode === '+') {
            const srcUser = data.username;
            const destUser = data.destination;
            sockets.forEach(s => {
                if (typeof s.username !== "undefined")
                    if (s.username.indexOf(socket.channel + '%%%%' + destUser + '@') === 0) {
                        s.emit('send_file_request', { username: srcUser, destination: destUser } );
                        logger('Send file request from ' + srcUser + ' to ' + destUser)
                    }   
            })
        } else {
            socket.emit('server_message', {
                message : 'you need to be an operator for this', username : ':'
            })
        }
    });

    socket.on('accept_file', data => {
        const srcUser = data.username;
        const destUser = data.destination;
        sockets.forEach(s => {
            if (typeof s.username !== "undefined")
                if (s.username.indexOf(socket.channel + '%%%%' + srcUser + '@') === 0) {
                    s.emit('accept_file', { username: srcUser, destination: destUser } );
                    logger('Accept file request from ' + srcUser + ' to ' + destUser)
                }
        })
    });

    socket.on('refuse_file', data => {
        const srcUser = data.username;
        const destUser = data.destination;
        sockets.forEach(s => {
            if (typeof s.username !== "undefined")
                if (s.username.indexOf(socket.channel + '%%%%' + srcUser + '@') === 0) {
                    s.emit('refuse_file', { username: srcUser, destination: destUser } );
                    logger('Refused file request from ' + srcUser + ' to ' + destUser)
                }
        })
    });

    socket.on('send_file', data => {
        if (socket.mode === '+') {
            const destUser = data.destination;
            const username = data.username;
            const filename = data.filename;
            sockets.forEach(s => {
                if (typeof s.username !== "undefined")
                    if (s.username.indexOf(socket.channel + '%%%%' + destUser + '@') === 0) {
                        s.emit('receive_file', {
                            username: username,
                            filename: filename,
                            content: data.content
                        } );
                        logger('Send file to ' + data.destination)
                    }
            })
        } else {
            socket.emit('server_message', {
                message : 'you need to be an operator for this', username : ':'
            })
        }
    });

    socket.on('disconnect', () => {
        sockets.splice(sockets.indexOf(socket), 1);
        if (typeof socket.username === 'undefined') initUser();
        let user = socket.username.split('%%%%')[1];
        logger('user ' + socket.username + ' disconnected');
        let index = -1;
        for (let i=0; i<users.length; i++) {
            if (users[i].indexOf(socket.username) === 0) index = i
        }
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
    });

    socket.on('change_username', data => {
        if (socket.username === undefined) {
            initUser()
        }
        let name = data.username || '';
        name = name
            .replace(/<(?:.|\n)*?>/gm, '')
            .replace(/[&@;!#<>]/g, '_')
            .substring(0, USER_MAX_LENGTH)
            .replace(/ /g, '_');
        let user = socket.username.split('%%%%')[1];
        let shortUser = user.substring(0, user.lastIndexOf('@'));
        if (userExists(users, shortUser)) {
            if (userExists(users, name)) {
                logger(`${name} already exists.`);
                socket.emit('confirm_username', { user: user, channel: socket.channel } );
                socket.emit('server_message', {message : '"' + name + '" is already in use', username : ':'});
            } else if (name.length < 2) {
                logger('Too small.');
                socket.emit('confirm_username', { user: user, channel: socket.channel } );
            } else if (name.indexOf(':') > -1) {
                logger('Reserved.');
                socket.emit('confirm_username', { user: user, channel: socket.channel } );
            } else {
                logger(`user "${user}" → "${name}" (${socket.username})`);
                let index = -1;
                for (i=0; i<users.length; i++) {
                    if (users[i].indexOf(socket.channel + '%%%%' + user) === 0) index = i
                }
                if (index > -1) {
                    users[index] = socket.channel + '%%%%' + name +
                        '@' + socket.handshake.headers['x-real-ip'] +
                        '%%%%' + socket.mode
                }
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
                socket.emit('confirm_username',
                    {
                        user: socket.username.split('%%%%')[1],
                        channel: socket.channel
                    })
                logger(users)
            }
        }
    });

    socket.on('new_message', data => {
        if (socket.username === undefined) {
            logger('Sending message from undefined@' +
                socket.handshake.headers['x-real-ip'] + ' in channel ' + socket.channel);
            initUser()
        }
        if (banned.indexOf(socket.handshake.headers['x-real-ip'] + '@' + socket.channel) === 0) {
            logger('BANNED: ' + socket.handshake.headers['x-real-ip'] + '@' + socket.channel);
            return
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
                    if (socket.mode === '+' || commands[2] === operKey) {
                        socket.topic = message.substring(7, TOPIC_MAX_LENGTH);
                        io.to(socket.channel).emit('topic', {topic : socket.topic, username : ':'});
                        io.to(socket.channel).emit('server_message',
                        {message : shortUser + ' changed topic to "' + socket.topic + '"', username : ':'});
                    } else {
                        socket.emit('server_message',
                        {
                            message : 'you need to be an operator for this',
                            username : ':'
                        })
                    }
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
                if (commands[0] === '/KICK') {
                    if (socket.mode === '+') {
                        let kickedUser = commands[1];
                        let msg = '';
                        if (commands.length > 2)
                            msg = ': ' + message.substring(7 + kickedUser.length);

                        for (let i=0; i<sockets.length; i++) {
                            if (typeof sockets[i].username !== "undefined") {
                                if (sockets[i].username.indexOf(socket.channel + '%%%%' + kickedUser) === 0) {
                                    io.to(socket.channel).emit('server_message',
                                    {message : shortUser + ' kicks ' + kickedUser +
                                        ' from channel ' + socket.channel + msg,
                                        username : ':'});
                                    sockets[i].disconnect();
                                    logger(shortUser + ' kicks ' + kickedUser);
                                }
                            }
                        }
                    } else {
                        logger('Wrong mode!! ' + socket.username)
                    }
                }
                if (commands[0] === '/BAN') {
                    if (socket.mode === '+' || commands[2] === operKey) {
                        let bannedUser = commands[1];
                        for (let i=0; i<sockets.length; i++) {
                            if (typeof sockets[i].username !== "undefined") {
                                if (sockets[i].username.indexOf(socket.channel + '%%%%' + bannedUser) === 0) {
                                    sockets[i].banned = true;
                                    banned.push(sockets[i].handshake.headers['x-real-ip'] +
                                        '@' + socket.channel)
                                    io.to(socket.channel).emit('server_message',
                                    {message : shortUser + ' bans ' + sockets[i].handshake.headers['x-real-ip'] + '@' +
                                        socket.channel + ' (' + bannedUser + ')',
                                        username : ':'});
                                    sockets[i].disconnect();
                                    logger(shortUser + ' bans ' + bannedUser);
                                    logger(banned);
                                }
                            }
                        }
                    } else {
                        logger('Wrong mode!! ' + socket.username)
                    }
                }
                if (commands[0] === '/UNBAN') {
                    if (socket.mode === '+' || commands[2] === operKey) {
                        let unBannedUser = commands[1];
                        if (banned.indexOf(unBannedUser) === 0) {
                            banned.splice(banned.indexOf(unBannedUser), 1);
                            io.to(socket.channel).emit('server_message',
                            {message : shortUser + ' unbans ' + unBannedUser,
                                username : ':'});
                            logger(shortUser + ' unbans ' + unBannedUser);
                            logger(banned);
                        }
                    } else {
                        logger('Wrong mode!! ' + socket.username)
                    }
                }
                if (commands[0] === '/DEOP') {
                    if (socket.mode === '+' || commands[2] === operKey) {
                        let deopUser = commands[1];
                        for (i=0; i<users.length; i++) {
                            if (users[i].indexOf(socket.channel + '%%%%' + deopUser) === 0) {
                                logger(shortUser + ' deops ' + deopUser);
                                users[i] = users[i].substring(0, users[i].length - 1) + '-';
                                io.to(socket.channel).emit('server_message',
                                    {message : shortUser + ' removes operator status from ' +
                                    deopUser, username : ':'});
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
                                        if (s.username.indexOf(socket.channel + '%%%%' + deopUser + '@') === 0) {
                                            s.mode = '-';
                                            s.username = s.username.substring(0, s.username.length - 1) + '-'; 
                                        }
                                })            
                            } 
                        }
                    } else {
                        logger('Wrong mode!! '+ socket.username)
                    }
                }
                if (commands[0] === '/OP') {
                    if (socket.mode === '+' || commands[2] === operKey) {
                        let opUser = commands[1];
                        for (i=0; i<users.length; i++) {
                            if (users[i].indexOf(socket.channel + '%%%%' + opUser) === 0) {
                                logger(shortUser + ' ops ' + opUser);
                                users[i] = users[i].substring(0, users[i].length - 1) + '+';
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
                                            s.username = s.username.substring(0, s.username.length - 1) + '+'; 
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
            io.to(socket.channel).emit('new_message', {
                message : message, username : shortUser
            });

            // HAL stuff

            if ( socket.channel === 'cheapchat' ) {
                let emotions;
                let response = false;

                if (message.search(/hal|217\.169\.[23]/i) !== -1) {
                    let msg = {
                        message: shortUser,
                        username: HAL
                    };
                    if (Math.random() * 100 > 75) {
                        msg.message += ' (:'
                    }
                    if (message.search(/time|tijd|laat|datum|date/i) !== -1) {
                        response = true;
                        const moment = new Date();
                        msg.message = 'hey ' + shortUser + ', het is "' +
                            moment + '" (' + Date.now() + ')'
                    }
                    if (message.search(/217\.169\.[23]/i) !== -1) {
                        response = true;
                        if (Math.random() * 100 <= 66) {
                            msg.message = 'Leve de Koning, ' + user
                        } else {
                            msg.message = 'omerta, ' + user
                        }
                    }
                    if (message.search(/leeuw|leon|lion/i) !== -1) {
                        response = true;
                        msg.message = '🦁'
                        io.to(socket.channel).emit('hal_lion')
                    }
                    if (message.search(/hali/i) !== -1) {
                        response = true;
                        msg.message += ' huuuu (:'
                    }
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', msg)
                    }, Math.random() * Math.floor(3000))
                }

                if (message.search(/vuur|hell|666|satan|hel!|\ hel$|\ hel\ /i) !== -1) {
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: '🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥'
                        })
                    }, Math.random() * Math.floor(3000))
                }

                if (message.search(/huu/i) !== -1) {
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: 'huuuuuuuuuu (:'
                        })
                    }, Math.random() * Math.floor(3000))
                }
            
                if (message.search(/haha|hehe|hihi|hehe/i) !== -1) {
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: '(:'
                        })
                    }, Math.random() * Math.floor(3000))
                }

                if (message.search(/kut/i) !== -1) {
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: 'kut vagina'
                        })
                    }, Math.random() * Math.floor(3000))
                }

                if (message.search(/kan niet/i) !== -1) {
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: 'kan wel'
                        })
                    }, Math.random() * Math.floor(3000))
                }

                emotions = new RegExp([
                    'lul|klootzak|hufter|lief|dom|slim|gek|',
                    'slecht|boos|kwaad|gestoord|geil|homo|eik[eo]l|',
                    'tering|flikker|mafkee[sz]|hoer|kanker|neuk|',
                    'slet|bitch|slut|slet|ziek|sloer|vieze|vies'                    
                ].join(), 'i');

                if (message.search(/hal/i) !== -1 &&
                    response === false &&
                    //message.search(emotions) !== -1 &&
                    message.search(/hoeveel is|==\ /i) === -1) {
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    let msg = message;
                    msg = message
                        .replace(/,.*$/, '')
                        .replace('ik vind je', 'ik vind jou')
                        .replace('vindt je', 'vindt jou')
                        .replace('vind je', 'vindt jou')
                        .replace('weet je', 'weet jij')
                        .replace('met je', 'met jou')
                        .replace('ben je', 'ben jij')
                        .replace('aan je', 'aan jou')
                        .replace('je bent', 'jij bent')
                        .replace('je hebt', 'jij hebt')
                        .replace(/\s$/, '') + '!'
                    if (msg.search(/dank|thank|top|cool|ok dan|super|nice|gappie/i) !== -1) {
                        let hearts = [ '💕', '❤️❤️', '😍', '💖💖' ];
                        msg = hearts[Math.floor(Math.random() * 4)];
                    }
                    if (msg.split(' ').length > 2) {
                        msg = msg.replace(HAL, '')
                    } else {
                        msg = msg.replace(HAL, shortUser)
                    }
                    if (msg === shortUser + '!') {
                        msg = 'zeg het maar...'
                    }
                    setTimeout( () => {
                        clearInterval(halTyper);
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: msg
                        })
                    }, Math.random() * Math.floor(3000))
                }

                if (message.search(/hoeveel is|==\ /i) !== -1) {
                    let parser = new Parser();
                    let expr;
                    try {
                        expr = parser.parse(message
                            .replace(/.*hoeveel is|==\ /i, '')
                            .replace(/hal/i, '')
                            .replace('?', ''));
                    }
                    catch(error) {
                        logger(error)
                    }
                    let result = 'niets';
                    try {
                        result = String(expr.evaluate({}))
                    }
                    catch(error) {
                        logger(error)
                    }
                    if (result === 'true') {
                        result = 'waar'
                    }
                    if (result === 'false') {
                        result = 'niet waar'
                    }
                    let halTyper = setInterval( () => {
                        io.to(socket.channel).emit('typing', {
                            username : HAL + '@217.169.226.66'
                        });
                    }, 200);
                    setTimeout( () => {
                        clearInterval(halTyper);
                        if (result === '666') result = 'satan (666)';
                        io.to(socket.channel).emit('new_message', {
                            username: HAL,
                            message: 'dat is ' + result
                        })
                    }, Math.random() * Math.floor(3000))
                }

            }
        }
    });

    socket.on('stream_video_request', data => {
        if (socket.mode === '+') {
            const srcUser = data.username;
            const destUser = data.destination;
            sockets.forEach(s => {
                if (typeof s.username !== "undefined")
                    if (s.username.indexOf(socket.channel + '%%%%' + destUser + '@') === 0) {
                        s.emit('stream_video_request', { username: srcUser, destination: destUser } );
                        logger('Stream video request from ' + srcUser + ' to ' + destUser)
                    }   
            })
        } else {
            socket.emit('server_message', {
                message : 'you need to be an operator for this', username : ':'
            })
        }
    });

    socket.on('stream_video_accept', data => {
        const srcUser = data.username;
        const destUser = data.destination;
        sockets.forEach(s => {
            if (typeof s.username !== "undefined")
                if (s.username.indexOf(socket.channel + '%%%%' + srcUser + '@') === 0) {
                    s.emit('stream_video_accept', { username: srcUser, destination: destUser } );
                    socket.emit('stream_video_accept', { username: srcUser, destination: destUser } );
                    logger('Accept video stream: ' + srcUser + ' <-> ' + destUser)
                }
        })
    });

    socket.on('stream_video_refuse', data => {
        const srcUser = data.username;
        const destUser = data.destination;
        sockets.forEach(s => {
            if (typeof s.username !== "undefined")
                if (s.username.indexOf(socket.channel + '%%%%' + srcUser + '@') === 0) {
                    s.emit('stream_video_refuse', { username: srcUser, destination: destUser } );
                    logger('Refused video stream request from ' + srcUser + ' to ' + destUser)
                }
        })
    });

    socket.on('stream_video', data => {
        if (typeof socket.username != "undefined") {
            const destUser = data.destination;
            const srcUser = data.username;
            var ignore = false;
            if (socket.username.indexOf(socket.channel + '%%%%' + destUser + '@') != 0) {
                sockets.forEach(s => {
                    if (typeof s.username !== "undefined")
                        if (s.username.indexOf(socket.channel + '%%%%' + destUser + '@') === 0) {
                            if (!ignore) {
                                ignore = true;
                                s.emit('stream_video', data.image)
                            }
                        }
                })
            }
            if (socket.username.indexOf(socket.channel + '%%%%' + srcUser + '@') != 0) {
                sockets.forEach(s => {
                    if (typeof s.username !== "undefined")
                        if (s.username.indexOf(socket.channel + '%%%%' + srcUser + '@') === 0) {
                            if (!ignore) {
                                ignore = true;
                                s.emit('stream_video', data.image)
                            }
                        }
                })
            }
        }
    });

    socket.on('stream_audio', data => {
        if (typeof socket.username !== 'undefined') {
            const destUser = data.destination;
            const srcUser = data.username;
            var ignore = false;
            if (socket.username.indexOf(socket.channel + '%%%%' + destUser + '@') !== 0) {
                sockets.forEach(s => {
                    if (typeof s.username !== "undefined")
                        if (s.username.indexOf(socket.channel + '%%%%' + destUser + '@') === 0) {
                            if (!ignore) {
                                ignore = true;
                                s.emit('stream_audio', data)
                            }
                        }
                })
            }
            if (socket.username.indexOf(socket.channel + '%%%%' + srcUser + '@') !== 0) {
                sockets.forEach(s => {
                    if (typeof s.username !== "undefined")
                        if (s.username.indexOf(socket.channel + '%%%%' + srcUser + '@') === 0) {
                            if (!ignore) {
                                ignore = true;
                                s.emit('stream_video', data)
                            }
                        }
                })
            }
        }
    });

    socket.on('typing', () => {
        if (socket.username === undefined) {
            logger('"typing" to undefined in channel ' + socket.channel);
            initUser()
        }
        let user = socket.username.split('%%%%')[1];
        socket.broadcast.to(socket.channel).emit('typing', {username : user})
    })

});

logger('Server listening at TCP port 9999');
