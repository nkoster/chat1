$(function() {

    function urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
    }
    
    var
        socket = io('/cyberworld'),
        channel = $('#channel'),
        message = $('#message'),
        username = $('#username'),
        send_message = $('#send_message'),
        send_username = $('#send_username'),
        chatroom = $('#chatroom'),
        userlist = $('#userlist'),
        topic = $('#topic');

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
            urlify(data.message.replace(/<(?:.|\n)*?>/gm, '')) + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("server_message", function(data) {
        if (data.username === undefined) return;
        myDate = new Date();
        chatroom.append('<div class="message" style="color:#043"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            urlify(data.message.replace(/<(?:.|\n)*?>/gm, '')) + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("bold_message", function(data) {
        if (data.username === undefined) return;
        myDate = new Date();
        chatroom.append('<div class="message" style="color:#043"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ': &nbsp; ' + 
            urlify(data.message.replace(/<(?:.|\n)*?>/gm, '')) + '</b></span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("topic", function(data) {
        myDate = new Date();
        topic.html(data.topic);
    });

    socket.on('get_topic', function() {
        if (topic.length > 0) socket.emit('send_topic', { topic: topic.html() })
    });

    socket.on("update_userlist", function(data) {
        var list = '';
        data.userlist.forEach(function(element) {
            if (element !== null) {
                list += '<p class="user"><span class="inside"><b><span class="' + element + '">' +
                element + '</span></b></span></p>'
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
        var user = data.username.replace(/<(?:.|\n)*?>/gm, '');
        var all = document.getElementsByClassName(user);
        for (var i = 0; i < all.length; i++) {
            all[i].style.color = 'gray';
            all[i].style.fontStyle = 'italic';
        }
        setTimeout(function() {
            var all = document.getElementsByClassName(user);
            for (var i = 0; i < all.length; i++) {
                all[i].style.color = 'black';
                all[i].style.fontStyle = 'normal';
            }
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
