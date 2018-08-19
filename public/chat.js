$(function() {

    const
        socket = io('/cyberworld'),
        channel = $('#channel'),
        message = $('#message'),
        username = $('#username'),
        send_message = $('#send_message'),
        send_username = $('#send_username'),
        chatroom = $('#chatroom'),
        userlist = $('#userlist'),
        feedback = $('#feedback');

    send_message.click( () => {
        if (message.val() !== '') {
            socket.emit('new_message', {message : message.val()});
            message.val('')
        }
    });

    socket.on("new_message", data => {
        if (data.username === undefined) return;
        myDate = new Date();
        chatroom.append('<p class="message"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            data.message.replace(/<(?:.|\n)*?>/gm, '') + '</span></p>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("server_message", data => {
        if (data.username === undefined) return;
        myDate = new Date();
        chatroom.append('<p class="message" style="color:#060"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            data.message.replace(/<(?:.|\n)*?>/gm, '') + '</span></p>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("update_userlist", data => {
        let list = '';
        data.userlist.forEach(element => {
            if (element !== null) {
                list += '<p class="user"><span class="inside"><b>' +
                element + '</b></span></p>'
            }
        });
        userlist.html(list)
    });

    send_username.click(() => {
        socket.emit('change_username', {username : username.val()})
    });

    message.bind("keypress", () => {
        socket.emit('typing')
    });

    message.bind("keyup", event => {
        event.preventDefault();
        if (event.keyCode === 13 && message.val() !== '') {
            socket.emit('new_message', {message : message.val()});
            message.val('')
        }
    });

    username.keypress(e => {
        if (e.keyCode === 13) {
            const u = username.html().substring(0, 32).replace(/ /g, '_');
            socket.emit('change_username', {username : u});
            username.html(u)
        }
        return e.which != 13
    });

    socket.on('typing', data => {
        feedback.html(data.username.replace(/<(?:.|\n)*?>/gm, '') + ' is typing...');
        setTimeout( () => {
            feedback.html('')
        }, 500)
    });

    socket.on('confirm_username', (data) => {
        console.log(data);
        channel.html(data.channel.substring(0, 32).replace(/ /g, '_'));
        username.html(data.user.substring(0, 32).replace(/ /g, '_'));
    });

    socket.connect('http://localhost:9999');

    socket.emit('hello', { username: '' } );

    $(window).bind('beforeunload', () => {
        return 'Leave site?'
    })

});
