$(function() {

    function urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
    }
    
    var
        socket = io('/cheapchat'),
        cheap = $('#cheap'),
        channel = $('#channel'),
        message = $('#message'),
        username = $('#username'),
        send_message = $('#send_message'),
        send_username = $('#send_username'),
        chatroom = $('#chatroom'),
        userlist = $('#userlist'),
        topic = $('#topic'),
        yes = $('#yes'), no = $('#no'),
        alarm = false;

    send_message.click(function() {
        if (message.val() !== '') {
            socket.emit('new_message', {message : message.val()});
            message.val('')
        }
    });

    socket.on("new_message", function(data) {
        checkAlarm();
        if (data.username === undefined) return;
        var myDate = new Date();
        chatroom.append('<div class="message"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            urlify(data.message.replace(/<(?:.|\n)*?>/gm, '')) + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("server_message", function(data) {
        if (data.username === undefined) return;
        var myDate = new Date();
        chatroom.append('<div class="message" style="color:#043"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ':</b> &nbsp; ' + 
            urlify(data.message.replace(/<(?:.|\n)*?>/gm, '')) + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("bold_message", function(data) {
        checkAlarm();
        if (data.username === undefined) return;
        var myDate = new Date();
        chatroom.append('<div class="message" style="color:#043"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            data.username.replace(/<(?:.|\n)*?>/gm, '') + ': &nbsp; ' + 
            urlify(data.message.replace(/<(?:.|\n)*?>/gm, '')) + '</b></span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
    });

    socket.on("topic", function(data) {
        var myDate = new Date();
        topic.html(data.topic);
    });

    socket.on('get_topic', function() {
        if (topic.length > 0) socket.emit('send_topic', { topic: topic.html() })
    });

    socket.on("update_userlist", function(data) {
        var list = '';
        data.userlist.forEach(function(element) {
            if (element !== null) {
                var u = element.substring(0, element.lastIndexOf('@'));
                var ip = element.substring(element.lastIndexOf('@') + 1);
                var myClass = element;
                if (myClass[0] === '@') myClass = myClass.substring(1);
                list += '<p class="user"><span class="inside"><b><span class="' +
                myClass + '" title="' + u + ' at ' + ip + '">' + u + '</span></b></span></p>'
            }
        });
        userlist.html(list)
    });

    message.bind("keypress", function() {
        socket.emit('typing');
    });

    message.bind("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13 && message.val() !== '') {
            if (message.val() === '/beep') {
                var myDate = new Date();
                chatroom.append('<div class="message" style="color:#067"><span class="inside"><span class="mono">' + 
                    myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
                    '::</b> &nbsp; beep is set</span></div>');
                chatroom.scrollTop($('#chatroom')[0].scrollHeight);
                alarm = true
            } else if (message.val().split(' ')[0] === '/send') {
                var commands = message.val().split(' ');
                var destUser = commands[1];
                socket.emit('send_file_request',
                    {
                        destination: destUser,
                        username: username.html()
                    });
                var myDate = new Date();
                chatroom.append('<div class="message" style="color:#660"><span class="inside"><span class="mono">' + 
                    myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
                    '::</b> &nbsp; send file request to ' + destUser + '</span></div>');
                chatroom.scrollTop($('#chatroom')[0].scrollHeight);
            } else {
                socket.emit('new_message', {message : message.val()})
            }
            message.val('')
        }
    });

    socket.on('send_file_request', function(data) {
        if (!socket.sendFileLock) {
            socket.sendFileLock = true;
            socket.srcUser = data.username;
            socket.destUser = data.destination;
            openDialog(data);
        }
    });

    socket.on('refuse_file', function(data) {
        myDate = new Date();
        chatroom.append('<div class="message" style="color:#663"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            '::</b> &nbsp; request refused by ' + data.destination + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight);
    })

    socket.on('accept_file', function(data) {
        var destUser = data.destination;
        myDate = new Date();
        chatroom.append('<div class="message" style="color:#663"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
            '::</b> &nbsp; <input id="input" type="file"/></span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight);
        var input = $('#input');
        input.bind('change', function() {
            var f = this.files[0];
            if (f.size < 20000000) {
                var reader = new FileReader();
                reader.onload = function() {
                    console.log('sending ' + f.name + ' to ' + destUser);
                    socket.emit('send_file',
                        {
                            destination: destUser,
                            filename: f.name,
                            username: username.html(),
                            content: reader.result
                        } );
                }
                myDate = new Date();
                chatroom.append('<div class="message" style="color:#663"><span class="inside"><span class="mono">' + 
                    myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
                    '::</b> &nbsp; sending ' + f.name + ' to ' + destUser + '</span></div>');
                chatroom.scrollTop($('#chatroom')[0].scrollHeight);
                reader.readAsArrayBuffer(this.files[0]);
                var replaced = $('#input').parent().html().replace(/(<input ([^>]+)>)/, 'file selected');
                $('#input').parent().html(replaced)
            } else {
                myDate = new Date();
                chatroom.append('<div class="message" style="color:#700"><span class="inside"><span class="mono">' + 
                    myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
                    '::</b> &nbsp; file exceeds 20000000 bytes</span></div>');
                chatroom.scrollTop($('#chatroom')[0].scrollHeight); 
            }
        })
    });

    username.keypress(function(e) {
        if (e.keyCode === 13) {
            var u = username.html().substring(0, 32).replace(/ /g, '_');
            socket.emit('change_username', {username : u});
            username.html(u);
            message.focus()
        }
        return e.which != 13
    });

    function checkAlarm() {
        if (alarm) {
            var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
            snd.play();
            console.log('BEEP!');
            alarm = false;
            var myDate = new Date();
            chatroom.append('<div class="message" style="color:#067"><span class="inside"><span class="mono">' + 
                myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
                '::</b> &nbsp; <b>beep!</b></span></div>');
            chatroom.scrollTop($('#chatroom')[0].scrollHeight);
        }
    }

    socket.on('typing', function(data) {
        checkAlarm();
        var user = data.username.replace(/<(?:.|\n)*?>/gm, '');
        var all = document.getElementsByClassName(user);
        for (var i = 0; i < all.length; i++) {
            all[i].style.transition = 'all 0.2s';
            all[i].style.color = 'gray';
            all[i].style.fontStyle = 'italic';
        }
        setTimeout(function() {
            var all = document.getElementsByClassName(user);
            for (var i = 0; i < all.length; i++) {
                all[i].style.transition = 'all 0.2s';
                all[i].style.color = 'black';
                all[i].style.fontStyle = 'normal';
            }
        }, 700)
    });

    socket.on('confirm_username', function(data) {
        channel.html(data.channel.substring(0, 32).replace(/ /g, '_'));
        var u = data.user;
        u = u.substring(0, u.lastIndexOf('@')).substring(0, 32).replace(/ /g, '_');
        username.html(u);
    });

    socket.on('receive_file', function(data) {
        console.log('receiving ' + data.filename);
        var myDate = new Date();
        chatroom.append('<div class="message" style="color:#663"><span class="inside"><span class="mono">' + 
        myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b> ' + 
        '::</b> &nbsp; receiving ' + data.filename + ' from ' + data.username + '</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight);
        var saveByteArray = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (data, name) {
                var blob = new Blob(data, {type: "octet/stream"}),
                    url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = name;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());
        saveByteArray([data.content], data.filename);
    });

    function openDialog(data) {
        document.getElementsByClassName('title')[0].innerHTML = 
            data.username + ' wants to send a file to you. Accept?';
        window.setTimeout(function(){
            document.getElementsByClassName('dialog')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('dialog')[0]
            .style.height = '200px';
            document.getElementsByClassName('dialog')[0]
            .style.opacity = '1';
            document.getElementsByClassName('dialog')[0]
            .style.marginTop = '-100px';
            window.setTimeout(function() {
                document.getElementsByClassName('content')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('content')[0]
                .style.opacity = '0.8';
            }, 500)
        }, 500)
        yes.bind('click', function() {
            socket.emit('accept_file', { username:socket.srcUser, destination: socket.destUser });
            closeDialog()
        })
        no.bind('click', function() {
            socket.emit('refuse_file', { username:socket.srcUser, destination: socket.destUser });
            closeDialog()
        });
        window.setTimeout(function() {
            socket.emit('refuse_file', { username:socket.srcUser, destination: socket.destUser });
            closeDialog()
        }, 60000)
    }

    function closeDialog() {
        window.setTimeout(function(){
            document.getElementsByClassName('content')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('content')[0]
            .style.opacity = '0';
            window.setTimeout(function() {
                document.getElementsByClassName('dialog')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('dialog')[0]
                .style.height = '0';
                document.getElementsByClassName('dialog')[0]
                .style.opacity = '0';
                document.getElementsByClassName('dialog')[0]
                .style.marginTop = '0';
            }, 500)
        }, 200);
        socket.srcUser = '';
        socket.destUser = '';
        socket.sendFileLock = false
    }

    socket.connect('http://192.168.1.33:9999');

    socket.emit('hello', { username: username.html(), channel: channel.html() } );
    socket.on('reset', function() {
        socket.emit('hello', { username: username.html(), channel: channel.html() } );
    });

    $(window).bind('beforeunload', function() {
        return 'Leave site?'
    });

    setTimeout(function() { 
        cheap.css({transition : 'all 0.8s ease-in-out'});
        cheap.css({opacity: 0.9, height: '100%'});
        setTimeout(function() {
            cheap.css({transition : 'all 2s ease-in-out'});
            cheap.css({opacity: 1, height: '100%'})
        }, 3000)
    }, 0.5);

    message.focus()

});
