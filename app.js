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
	res.render('index')
});

io.on('connection', function(socket) {

    socket.username = "Anonymous";

    socket.on('hello', function(data) {
        socket.username = data.username;
        if (users.includes(socket.username)) {
            console.log(`${socket.username} already exists.`)
        } else {
            console.log(`connection from: "${socket.username}"`);
            users.push(socket.username);
            console.log(users)
        }
    });
  
    socket.on('change_username', (data) => {
        if (users.includes(socket.username)) {
            if (users.includes(data.username)) {
                console.log(`${data.username} already exists.`)
            } else {
                console.log(`user "${socket.username}" → "${data.username}"`);
                users[users.indexOf(socket.username)] = data.username;
                socket.username = data.username;
                console.log(users)
            }
        }
    });

    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username : socket.username})
    })

});

console.log('Server listening 127.0.0.1:9999');
