$(function() {

const
    socket = io.connect('http://192.168.1.33:9999')
    message = $("#message"),
    username = $("#username"),
    send_message = $("#send_message"),
    send_username = $("#send_username"),
    chatroom = $("#chatroom"),
    feedback = $("#feedback");

send_message.click( () => {
    if (message.val() !== '') {
        socket.emit('new_message', {message : message.val()});
        message.val('')
    }
});

socket.on("new_message", (data) => {
    if (data.username === undefined) return;
    myDate = new Date();
    chatroom.append('<p class="message">' + myDate.toString().split(/\s+/).slice(4,5) + ' - <b> ' + data.username + ':</b> &nbsp; ' + data.message + '</p>');
    chatroom.scrollTop($('#chatroom')[0].scrollHeight);
});

send_username.click(function(){
    socket.emit('change_username', {username : username.val()})
});

message.bind("keypress", () => {
    socket.emit('typing')
});

message.bind("keyup", (event) => {
    event.preventDefault();
    if (event.keyCode === 13 && message.val() !== '') {
        socket.emit('new_message', {message : message.val()});
        message.val('')
    }
});

username.bind('keyup', (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
        socket.emit('change_username', {username : username.val()})
    }
});

socket.on('typing', (data) => {
    feedback.html(data.username + ' is typing...');
    setTimeout( () => {
        feedback.html('')
    }, 1000)
});

username.val(Math.random().toString(36).substring(2, 15));
socket.emit('hello', { username: username.val() } );

});
