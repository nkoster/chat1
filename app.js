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
    if (queryChannel.length > 0) {
        socket.channel = queryChannel
    } else {
        socket.channel = Math.random().toString(36).substring(2, 15)
    }

    socket.join(queryChannel);

    socket.on('hello', data => {

        // User stuff
        if (queryUser.length > 0) { 
            socket.username = queryUser
        } else {
            socket.username = Math.random().toString(36).substring(2, 15);
        }

        if (users.includes(socket.username)) {
            console.log(`${socket.username} already exists.`);
            socket.username = Math.random().toString(36).substring(2, 15);
        } else {
            console.log(`connection from: "${socket.username}" to channel "${socket.channel}".`);
        }
        socket.emit('confirm_username', { user: socket.username, channel: socket.channel } );
        users.push(socket.channel + '%%%%' +  socket.username);
        let u = [];
        for (let i=0; i<users.length; i++) {
            if (users[i].indexOf(socket.channel) === 0) {
                u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
            }
        }
        io.to(socket.channel).emit('update_userlist', {userlist : u});
        io.to(socket.channel).emit('server_message', {message : socket.username +
            ' connected', username : ':'});
        // console.log(users);
    });

    socket.on('disconnect', () => {
        console.log('user ' + socket.username + ' disconnected');
        let index = users.indexOf(socket.channel + '%%%%' + socket.username);
        if (index > -1) {
            users.splice(index, 1);
            let u = [];
            for (let i=0; i<users.length; i++) {
                if (users[i].indexOf(socket.channel) === 0) {
                    u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
                }
            }
            io.to(socket.channel).emit('update_userlist', {userlist : u});
            io.to(socket.channel).emit('new_message', {message : socket.username +
                ' disconnected', username : ':'});
            // console.log(users)
        }
    });

    socket.on('change_username', data => {
        let name = data.username.replace(/<(?:.|\n)*?>/gm, '');
        if (users.includes(socket.channel + '%%%%' + socket.username)) {
            if (users.includes(socket.channel + '%%%%' + name)) {
                console.log(`${name + '%%%%' + socket.username} already exists.`)
            } else if (name.length < 1) {
                console.log('Too small.')
            } else if (name.indexOf(':') > -1) {
                console.log('Reserved.')
            } else {
                console.log(`user "${socket.username}" → "${name}"`);
                users[users.indexOf(socket.channel + '%%%%' + socket.username)] =
                    socket.channel + '%%%%' + name;
                let u = [];
                for (let i=0; i<users.length; i++) {
                    if (users[i].indexOf(socket.channel) === 0) {
                        u[i] = users[i].substring(users[i].indexOf('%%%%') + 4)
                    }
                }
                io.to(socket.channel).emit('update_userlist', {userlist : u});
                io.to(socket.channel).emit('server_message', {message : socket.username +
                    ' → ' + name, username : ':'});
                socket.username = name;
                console.log(users)
            }
        }
    });

    socket.on('new_message', data => {
        if (socket.username === undefined) return false;
        let message = data.message;
        message = message.replace(/<(?:.|\n)*?>/gm, '').trim();
        if (message === '') return false;
        if (message[0] === '/') {
            // console.log('command: ' + command)
        } else {
            if (message.length > MESSAGE_MAX_LENGTH) {
                message = message.substring(0, MESSAGE_MAX_LENGTH) + '... &larr; TRUNCATED'
            }
            io.to(socket.channel).emit('new_message', {message : message, username : socket.username});
        }
    });

    socket.on('typing', () => {
        if (socket.username === undefined) return false;
        socket.broadcast.to(socket.channel).emit('typing', {username : socket.username})
    })

});

console.log('Server listening at TCP port 9999');
