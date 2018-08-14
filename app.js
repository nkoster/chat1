const
    express = require('express'),
    app = express(),
    server = app.listen(9999),
    io = require("socket.io")(server);

let
    users = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render('index');
    queryUser = req.query.user ? req.query.user : ''
});

io.on('connection', socket => {

    socket.on('hello', data => {
        socket.username = data.username;
        if (socket.username === '') socket.username = Math.random().toString(36).substring(2, 15);
        if (queryUser.length > 0) socket.username = queryUser;
        if (users.includes(socket.username)) {
            console.log(`${socket.username} already exists.`);
            socket.username = Math.random().toString(36).substring(2, 15);
        } else {
            console.log(`connection from: "${socket.username}"`);
        }
        socket.emit('confirm_username', socket.username);
        users.push(socket.username);
        io.sockets.emit('update_userlist', {userlist : users});
        io.sockets.emit('new_message', {message : socket.username +
            ' connected', username : ':'});
        console.log(users)
    });

    socket.on('disconnect', () => {
        console.log('user ' + socket.username + ' disconnected');
        let index = users.indexOf(socket.username);
        if (index > -1) {
            users.splice(index, 1);
            io.sockets.emit('update_userlist', {userlist : users});
            io.sockets.emit('new_message', {message : socket.username +
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
                io.sockets.emit('update_userlist', {userlist : users});
                io.sockets.emit('new_message', {message : socket.username +
                    ' → ' + data.username, username : ':'});
                socket.username = data.username;
                console.log(users)
            }
        }
    });

    socket.on('new_message', data => {
        if (socket.username === undefined) return;
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    });

    socket.on('typing', () => {
        if (socket.username === undefined) return;
        socket.broadcast.emit('typing', {username : socket.username})
    })

});

console.log('Server listening at TCP port 9999');
