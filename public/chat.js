$(function() {

const
    socket = io.connect('http://localhost:9999')
    message = $("#message"),
    username = $("#username"),
    send_message = $("#send_message"),
    send_username = $("#send_username"),
    chatroom = $("#chatroom"),
    feedback = $("#feedback");

send_message.click( () => {
    socket.emit('new_message', {message : message.val()});
    message.val('')
});

socket.on("new_message", (data) => {
    // feedback.html('');
    // message.val('');
    chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
});

send_username.click(function(){
    socket.emit('change_username', {username : username.val()})
});

message.bind("keypress", () => {
    socket.emit('typing')
});

message.bind("keyup", (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
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
    feedback.html("<p><i>" + data.username + " is typing..." + "</i></p>");
    setTimeout( () => {
        feedback.html('')
    }, 5000)
});

});
