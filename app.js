const
    express = require('express'),
    app = express(),
    server = app.listen(9999),
    io = require("socket.io")(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
	res.render('index')
});

io.on('connection', (socket) => {
    socket.username = "Anonymous";
    
    socket.on('change_username', (data) => {
        console.log(`user "${socket.username}" → "${data.username}"`);
        socket.username = data.username
    });

    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    });

    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
});
