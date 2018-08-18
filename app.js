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
    queryChannel = req.query.channel ? req.query.channel : '';
    queryChannel = queryChannel.substring(0, CHANNEL_MAX_LENGTH).replace(/ /g, '_');
    res.render('index')
});

io.on('connection', socket => {

    socket.on('hello', data => {

        // Channel stuff
        if (queryChannel.length > 0) {
            socket.channel = queryChannel
        } else {
            socket.channel = Math.random().toString(36).substring(2, 15)
        }

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
        users.push(socket.username);
        io.emit('update_userlist', {userlist : users});
        io.emit('new_message', {message : socket.username +
            ' connected', username : ':'});
        // console.log(users);
        // console.log(channels)
    });

    socket.on('disconnect', () => {
        console.log('user ' + socket.username + ' disconnected');
        let index = users.indexOf(socket.username);
        if (index > -1) {
            users.splice(index, 1);
            io.emit('update_userlist', {userlist : users});
            io.emit('new_message', {message : socket.username +
                ' disconnected', username : ':'});
            console.log(users)
        }
    });

    socket.on('change_username', data => {
        if (users.includes(socket.username)) {
            if (users.includes(data.username)) {
                console.log(`${data.username} already exists.`)
            } else if (data.username.replace(/<(?:.|\n)*?>/gm, '').length < 1) {
                console.log('Too small.')
            } else if (data.username.indexOf(':') > -1) {
                console.log('Reserved.')
            } else {
                console.log(`user "${socket.username}" → "${data.username}"`);
                users[users.indexOf(socket.username)] = data.username;
                io.emit('update_userlist', {userlist : users});
                io.emit('new_message', {message : socket.username +
                    ' → ' + data.username, username : ':'});
                socket.username = data.username;
                console.log(users)
            }
        }
    });

    function resetClient() {
        console.log('Undefined username.');
        socket.username = Math.random().toString(36).substring(2, 15);
        socket.emit('confirm_username', socket.username);
        users.push(socket.username);
        io.emit('update_userlist', {userlist : users});
        io.emit('new_message', {message : socket.username +
            ' connected', username : ':'});
        console.log(users)
    }

    socket.on('new_message', data => {
        if (socket.username === undefined) resetClient();
        let message = data.message;
        message = message.replace(/<(?:.|\n)*?>/gm, '').trim();
        if (message === '') return false;
        if (message[0] === '/') {
            console.log('command')
        } else {
            if (message.length > MESSAGE_MAX_LENGTH) {
                message = message.substring(0, MESSAGE_MAX_LENGTH) + '... &larr; TRUNCATED'
            }
            io.emit('new_message', {message : message, username : socket.username});
        }
    });

    socket.on('typing', () => {
        if (socket.username === undefined) resetClient();
        socket.broadcast.emit('typing', {username : socket.username})
    })

});

console.log('Server listening at TCP port 9999');
