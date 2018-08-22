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
    users = [];
    queryUser = '', queryChannel = '';

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

io.on('connection', socket => {

    // Channel stuff
    if (socket.channel === undefined) {
        if (queryChannel.length > 0) {
            socket.channel = queryChannel
        } else {
            socket.channel = 'cyberworld'
        }
    }

    socket.join(socket.channel);

    socket.on('hello', data => {

        // User stuff
        if (socket.username === undefined) {
            if (queryUser.length > 0) { 
                socket.username = socket.channel + '%%%%' + queryUser;
                queryUser = ''
            } else {
                socket.username = socket.channel + '%%%%' + Math.random().toString(36).substring(2, 15);
            }

            if (users.includes(socket.username)) {
                logger(`${socket.username} already exists.`);
                socket.username = socket.channel + '%%%%' + Math.random().toString(36).substring(2, 15);
            } else {
                logger(`connection from: "${socket.username}" to channel "${socket.channel}".`);
            }
        }
        let user = socket.username.split('%%%%');
        socket.emit('confirm_username', { user: user[1], channel: socket.channel } );
        users.push(socket.username);
        let u = [];
        for (let i=0; i<users.length; i++) {
            if (users[i].indexOf(socket.channel) === 0) {
                u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
            }
        }
        io.to(socket.channel).emit('update_userlist', {userlist : u});
        io.to(socket.channel).emit('server_message', {message : user[1] +
            ' connected', username : ':'});
        logger(users)
    });

    socket.on('disconnect', () => {
        if (socket.username === undefined) {
            logger('Disconnect from undefined. ' + socket.handshake.address)
        } else {
            let user = socket.username.split('%%%%');
            logger('user ' + socket.username + ' disconnected');
                let index = users.indexOf(socket.username);
                if (index > -1) {
                    users.splice(index, 1);
                    let u = [];
                    for (let i=0; i<users.length; i++) {
                        if (users[i].indexOf(socket.channel) === 0) {
                            u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
                        }
                    }
                io.to(socket.channel).emit('update_userlist', {userlist : u});
                io.to(socket.channel).emit('new_message', {message : user[1] +
                    ' disconnected', username : ':'});
                // logger(users)
            }
        }
    });

    socket.on('change_username', data => {
        if (socket.username === undefined) {
            logger('aaaarg')
            return false
        }
        let name = data.username.replace(/<(?:.|\n)*?>/gm, '');
        let user = socket.username.split('%%%%');
        if (users.includes(socket.username)) {
            if (users.includes(socket.channel + '%%%%' + name)) {
                logger(`${name + '%%%%' + socket.username} already exists.`)
            } else if (name.length < 1) {
                logger('Too small.')
            } else if (name.indexOf(':') > -1) {
                logger('Reserved.')
            } else {
                logger(`user "${user[1]}" → "${name}"`);
                users[users.indexOf(socket.username)] = socket.channel + '%%%%' + name;
                let u = [];
                for (let i=0; i<users.length; i++) {
                    if (users[i].indexOf(socket.channel) === 0) {
                        u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
                    }
                }
                io.to(socket.channel).emit('update_userlist', {userlist : u});
                io.to(socket.channel).emit('server_message', {message : user[1] +
                    ' → ' + name, username : ':'});
                socket.username = socket.channel + '%%%%' + name;
                logger(users)
            }
        }
    });

    function resetUser() {

        socket.username = socket.channel + '%%%%' + Math.random().toString(36).substring(2, 15);
        socket.join(socket.channel);
        let user = socket.username.split('%%%%');
        socket.emit('confirm_username', { user: user[1], channel: socket.channel } );
        users.push(socket.username);
        let u = [];
        for (let i=0; i<users.length; i++) {
            if (users[i].indexOf(socket.channel) === 0) {
                u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
            }
        }
        io.to(socket.channel).emit('update_userlist', {userlist : u});
        io.to(socket.channel).emit('server_message', {message : user[1] +
            ' connected', username : ':'});
        logger('resetUser()');
        logger(users)
        //socket.emit('reset', 'reset');
    }

    socket.on('new_message', data => {
        if (socket.username === undefined) {
            logger('Sending message from undefined in channel ' + socket.channel);
            resetUser()
        }
        let message = data.message;
        let user = socket.username.split('%%%%');
        message = message.replace(/<(?:.|\n)*?>/gm, '').trim();
        if (message === '') return false;
        if (message[0] === '/') {
            // logger('command: ' + command)
        } else {
            if (message.length > MESSAGE_MAX_LENGTH) {
                message = message.substring(0, MESSAGE_MAX_LENGTH) + '... &larr; TRUNCATED'
            }
            io.to(socket.channel).emit('new_message', {message : message, username : user[1]});
        }
    });

    socket.on('typing', () => {
        if (socket.username === undefined) {
            logger('"typing" to undefined in channel ' + socket.channel);
            resetUser()
        }
        let user = socket.username.split('%%%%');
        socket.broadcast.to(socket.channel).emit('typing', {username : user[1]})
    })

});

logger('Server listening at TCP port 9999');
