$(function() {

    var
        socket = io('/cyberworld'),
        channel = $('#channel'),
        message = $('#message'),
        username = $('#username'),
        send_message = $('#send_message'),
        send_username = $('#send_username'),
        chatroom = $('#chatroom'),
        userlist = $('#userlist'),
        feedback = $('#feedback');

    send_message.click(function() {
        if (message.val() !== '') {
            socket.emit('new_message', {message : message.val()});
            message.val('')
        }
    });

    socket.on("new_message", function(data) {
        if (data.username === undefined) return;
        myDate = new Date();
        chatroom.append('<div class="message"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            data.message.replace(/<(?:.|\n)*?>/gm, '') + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("server_message", function(data) {
        if (data.username === undefined) return;
        myDate = new Date();
        chatroom.append('<div class="message" style="color:#043"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            data.message.replace(/<(?:.|\n)*?>/gm, '') + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("update_userlist", function(data) {
        var list = '';
        data.userlist.forEach(function(element) {
            if (element !== null) {
                list += '<p class="user"><span class="inside"><b>' +
                element + '</b></span></p>'
            }
        });
        userlist.html(list)
    });

    send_username.click(function() {
        socket.emit('change_username', {username : username.val()})
    });

    message.bind("keypress", function() {
        socket.emit('typing')
    });

    message.bind("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13 && message.val() !== '') {
            socket.emit('new_message', {message : message.val()});
            message.val('')
        }
    });

    username.keypress(function(e) {
        if (e.keyCode === 13) {
            var u = username.html().substring(0, 32).replace(/ /g, '_');
            socket.emit('change_username', {username : u});
            username.html(u)
        }
        return e.which != 13
    });

    socket.on('typing', function(data) {
        feedback.html(data.username.replace(/<(?:.|\n)*?>/gm, '') + ' is typing...');
        setTimeout(function() {
            feedback.html('')
        }, 500)
    });

    socket.on('confirm_username', function(data) {
        console.log(data);
        channel.html(data.channel.substring(0, 32).replace(/ /g, '_'));
        username.html(data.user.substring(0, 32).replace(/ /g, '_'));
    });

    socket.connect('http://192.168.1.33:9999');

    socket.emit('hello', { username: username.html(), channel: channel.html() } );
    socket.on('reset', function() {
        socket.emit('hello', { username: username.html(), channel: channel.html() } );
    });

    $(window).bind('beforeunload', function() {
        return 'Leave site?'
    })

});
