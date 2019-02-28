$(function() {

    function urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
    }

    function beep() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        snd.play();
        return
    }

    var
        socket = io('/cheapchat'),
        cheap = $('#cheap'),
        channel = $('#channel'),
        message = $('#message'),
        messageBuffer = [],
        messageBufferIndex = 0,
        username = $('#username'),
        send_message = $('#send_message'),
        chatroom = $('#chatroom'),
        userlist = $('#userlist'),
        topic = $('#topic'),
        yes = $('#yes'), no = $('#no'),
        request_video_accept = $('#request_video_accept'),
        request_video_refuse = $('#request_video_refuse'),
        stream_video_cancel = $('#stream_video_cancel'),
        alarm = false,
        streaming, camera = false,
        help = [
            '<pre>----  generic commands</pre>',
            '<pre>  /user &lt;name&gt;               change your name (/nick works too)</pre>',
            '<pre>  /join &lt;channel&gt;            join a channel in a new tab</pre>',
            '<pre>  /msg &lt;user&gt; &lt;some text&gt;    send a private message to a user</pre>',
            '<pre>  /me &lt;some text&gt;            prints your name + some text in bold to the channel</pre>',
            '<pre>  /clear                     clear the chat (client)</pre>',
            '<pre>  /beep                      set activity alarm</pre>',
            '<pre>  /lol                       prints "hahaha" to the channel</pre>',
            '<pre>  /tr &lt;lang[,lang]&gt; &lt;text&gt;   translate &lt;text&gt; to &lt;lang&gt;, and from [,lang] (tnx Google!)</pre>',
            '<pre>      lang codes: https://sites.google.com/site/tomihasa/google-language-codes</pre>',
            '<pre>      warning: when omitting [,lang], the default is "nl", dutch.</pre>',
            '<pre>----  operator commands</pre>',
            '<pre>  /op &lt;user&gt;                 give operator status to a user</pre>',
            '<pre>  /deop &lt;user&gt;               remove operator status from a user</pre>',
            '<pre>  /topic &lt;a topic&gt;           set the channel topic</pre>',
            '<pre>  /send &lt;user&gt;               send a file, max 20mb</pre>',
            '<pre>  /kick &lt;user&gt;               kick somebody from the channel</pre>',
            '<pre>  /ban &lt;user&gt;                ban somebody from the channel</pre>',
            '<pre>  /unban &lt;ip@channel&gt;        remove a ban</pre>',
            '<pre>---- URL format</pre>',
            '<pre>  you can use a URL like "https://cheapchat.nl/foo/bar" in the browser</pre>',
            '<pre>  to directly open a channel "foo" as user "bar"</pre>'
        ];

    send_message.click(function() {
        if (message.val() !== '') {
            socket.emit('new_message', {message : message.val()});
            message.val('')
        }
    });

    function chat(msg, usr, color, bold, html) {
        var myDate = new Date();
        var b1 = '</b>', b2 = '';
        var m = msg;
        if (bold) {
            b1 = '';
            b2 = '</b>'
        }
        if (!html) {
            m = urlify(msg.replace(/<(?:.|\n)*?>/gm, ''))
        }
        m = emoji(m);
        chatroom.append('<div class="message" style="color:' + color +
            '"><span class="inside"><span class="mono">' + 
            myDate.toString().split(/\s+/).slice(4,5) + '</span> &nbsp; <b>  ' + 
            usr.replace(/<(?:.|\n)*?>/gm, '') + ':' + b1 + ' &nbsp; ' + 
            m + b2 +'</span></div>');
        chatroom.scrollTop($('#chatroom')[0].scrollHeight)
        return
    }

    socket.on("new_message", function(data) {
        checkAlarm();
        if (typeof data.username != 'undefined') {
            chat(data.message, data.username, 'black', false, false)
        }
    });

    socket.on("server_message", function(data) {
        if (typeof data.username != 'undefined') {
            chat(data.message, data.username, '#043', false, false)
        }
    });

    socket.on("bold_message", function(data) {
        checkAlarm();
        if (typeof data.username != 'undefined') {
            chat(data.message, data.username, '#043', true, false)
        }
    });

    socket.on("topic", function(data) {
        topic.html(emoji(data.topic));
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
        socket.emit('typing', { username: username.html() });
    });

    message.bind("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13 && message.val() !== '') {
            messageBufferIndex = messageBuffer.length;
            messageBuffer.push(message.val());
            if (message.val() === '/help') {
                help.forEach(function(h) {
                    chat(h, ':', '#052', false, true)
                })
            } else if (message.val() === '/beep') {
                chat('beep is set', ':', '#067', false, false);
                alarm = true
            } else if (message.val().split(' ')[0] === '/send') {
                var commands = message.val().split(' ');
                var destUser = commands[1];
                socket.emit('send_file_request',
                    {
                        destination: destUser,
                        username: username.html()
                    });
                chat('send file request to ' + destUser, ':', '#660', false, false)
            } else if (message.val().split(' ')[0] === '/user' || message.val().split(' ')[0] === '/nick') {
                var commands = message.val().split(' ');
                var newUser = commands[1];
                socket.emit('change_username', { username: newUser })
            } else if (message.val().split(' ')[0] === '/join') {
                var commands = message.val().split(' ');
                var channel = commands[1];
                window.open('https://cheapchat.nl/' + channel, '_blank');
            } else if (message.val().split(' ')[0] === '/clear') {
                chatroom.html('')
            } else if (message.val().split(' ')[0] === '/camera') {
                var commands = message.val().split(' ');
                var destUser = commands[1];
                socket.emit('stream_video_request',
                    {
                        destination: destUser,
                        username: username.html()
                    });
                chat('send video stream request to ' + destUser, ':', '#660', false, false)
            } else if (message.val().split(' ')[0] === '/tr') {
                var commands = message.val().split(' ');
                var lang = commands[1];
                var text = message.val().substring(('/tr ' + lang).length + 1);
                tr(lang, text, socket);
            } else if (message.val().split(' ')[0] === '/save') {
                chat('save chatroom to file', ':', '#660', false, false)
            } else if (message.val().split(' ')[0] === '/wtf') {
                socket.emit('wtf')
            } else {
                socket.emit('new_message', {message : message.val()})
            }
            message.val('');
        }
        if (event.keyCode === 38) {
            if (messageBufferIndex > 0) messageBufferIndex -= 1;
            message.val(messageBuffer[messageBufferIndex]);
        }
        if (event.keyCode === 40) {
            if (messageBufferIndex < messageBuffer.length - 1) messageBufferIndex += 1;
            message.val(messageBuffer[messageBufferIndex])
        }
    });

    function tr(lang, text, socket) {
        function processRequest(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                if (o === 'nl') {
                    socket.emit('new_message', {message : xhr.responseText.split('"')[1]})
                } else {
                    chat(xhr.responseText.split('"')[1], ':', '#663', false, false)
                }
            }
        }
        var xhr = new XMLHttpRequest();
        var o;
        var l = 'en';
        if (lang.indexOf(',' > -1)) {
            o = lang.split(',')[1];
            l = lang.split(',')[0];
        }
        if (!o) {
            o = 'nl'
        }
        xhr.open('GET', 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
        o + '&tl=' + l + '&dt=t&q=' + text, true);
        xhr.send();
        xhr.onreadystatechange = processRequest;
    }

    socket.on('send_file_request', function(data) {
        if (!socket.sendFileLock) {
            socket.sendFileLock = true;
            socket.srcUser = data.username;
            socket.destUser = data.destination;
            openFileDialog(data);
        }
    });

    socket.on('refuse_file', function(data) {
        chat('request refused by ' + data.destination, ':', '#663', false, false)
    })

    socket.on('accept_file', function(data) {
        var destUser = data.destination;
        chat('<input id="input" type="file"/>', ':', '#663', false, true);
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
                chat('sending ' + f.name + ' to ' + destUser, ':', '#663', false, false);
                reader.readAsArrayBuffer(this.files[0]);
                var replaced = $('#input').parent().html().replace(/(<input ([^>]+)>)/, 'file selected');
                $('#input').parent().html(replaced)
            } else {
                chat('file exceeds 20000000 bytes', ':', '#700', false, false)
            }
        })
    });

    username.bind("keyup", function(e) {
        if (e.keyCode === 13) {
            var u = username.html().substring(0, 32).replace(/ /g, '_');
            socket.emit('change_username', {username : u});
            username.html(u);
            message.focus();
            return false
        } else {
            return e.which != 13
        }
    });

    function checkAlarm() {
        if (alarm) {
            beep();
            console.log('BEEP!');
            alarm = false;
            chat('beep!', ':', '#067', true, false)
        }
    }

    socket.on('hal_lion', function() {
        setTimeout(function() {
            cheap.css({transition : 'all 0.8s ease-in-out'});
            cheap.css({opacity: 0.4, height: '100%'});
            setTimeout(function() {
                cheap.css({transition : 'all 2s ease-in-out'});
                cheap.css({opacity: 0.3, height: '100%'});
                setTimeout(function() {
                    cheap.css({transition : 'all 0.8s ease-in-out'});
                    cheap.css({opacity: 0.9, height: '100%'});
                    setTimeout(function() {
                        cheap.css({transition : 'all 2s ease-in-out'});
                        cheap.css({opacity: 1, height: '100%'})
                    }, 3000)
                }, 0.5);        
            }, 3000)
        }, 0.5);
    });

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
        var c = data.channel.substring(0, 32).replace(/ /g, '_');
        channel.html('<span title="channel: ' + c + '">' + c + '</span>');
        var u = data.user;
        u = u.substring(0, u.lastIndexOf('@')).substring(0, 32).replace(/ /g, '_');
        username.html(u);
    });

    socket.on('receive_file', function(data) {
        console.log('receiving ' + data.filename);
        chat('receiving ' + data.filename + ' from ' + data.username, ':', '#663', false, false)
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

    function openFileDialog(data) {
        var timedOut;
        document.getElementsByClassName('file-title')[0].innerHTML = 
            data.username + ' wants to send a file to you. Accept?';
        window.setTimeout(function(){
            document.getElementsByClassName('file-dialog')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('file-dialog')[0]
            .style.height = '250px';
            document.getElementsByClassName('file-dialog')[0]
            .style.opacity = '0.9';
            document.getElementsByClassName('file-dialog')[0]
            .style.marginTop = '-125px';
            window.setTimeout(function() {
                beep();
                document.getElementsByClassName('file-content')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('file-content')[0]
                .style.opacity = '0.9';
            }, 500)
        }, 500)
        yes.bind('click', function() {
            socket.emit('accept_file', { username: socket.srcUser, destination: socket.destUser });
            clearTimeout(timedOut);
            closeFileDialog()
        })
        no.bind('click', function() {
            if (typeof socket.srcUser != 'undefined' && socket.srcUser != '') {
                chat('send file request from ' + socket.srcUser + ' refused', ':', '#840', false, false)
                socket.emit('refuse_file', { username: socket.srcUser, destination: socket.destUser })
            }
            clearTimeout(timedOut);
            closeFileDialog();
        });
        timedOut = setTimeout(function() {
            if (typeof socket.srcUser != 'undefined' && socket.srcUser != '') {
                chat('send file request from ' + socket.srcUser + ' timed out', ':', '#840', false, false)
                socket.emit('refuse_file', { username: socket.srcUser, destination: socket.destUser })
            }
            closeFileDialog();
        }, 60000)
    }

    function closeFileDialog() {
        window.setTimeout(function(){
            document.getElementsByClassName('file-content')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('file-content')[0]
            .style.opacity = '0';
            window.setTimeout(function() {
                document.getElementsByClassName('file-dialog')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('file-dialog')[0]
                .style.height = '0';
                document.getElementsByClassName('file-dialog')[0]
                .style.opacity = '0';
                document.getElementsByClassName('file-dialog')[0]
                .style.marginTop = '0';
            }, 500)
        }, 200);
        socket.srcUser = '';
        socket.destUser = '';
        socket.sendFileLock = false;
        message.focus()
    }

    function openRequestVideoDialog(data) {
        var timedOut;
        document.getElementsByClassName('video-request-title')[0].innerHTML = 
            data.username + ' wants to open a video stream with you. Accept?';
        window.setTimeout(function(){
            document.getElementsByClassName('video-request-dialog')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('video-request-dialog')[0]
            .style.height = '250px';
            document.getElementsByClassName('video-request-dialog')[0]
            .style.opacity = '0.9';
            document.getElementsByClassName('video-request-dialog')[0]
            .style.marginTop = '-125px';
            window.setTimeout(function() {
                beep();
                document.getElementsByClassName('video-request-content')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('video-request-content')[0]
                .style.opacity = '0.9';
            }, 500)
        }, 500)
        request_video_accept.bind('click', function() {
            socket.emit('stream_video_accept', { username: socket.srcUser, destination: socket.destUser });
            clearTimeout(timedOut);
            closeRequestVideoDialog()
        })
        request_video_refuse.bind('click', function() {
            if (typeof socket.srcUser != 'undefined' && socket.srcUser != '') {
                chat('video stream request from ' + socket.srcUser + ' refused', ':', '#840', false, false)
                socket.emit('stream_video_refuse', { username: socket.srcUser, destination: socket.destUser })
            }
            clearTimeout(timedOut);
            closeRequestVideoDialog();
        });
        timedOut = setTimeout(function() {
            if (typeof socket.srcUser != 'undefined' && socket.srcUser != '') {
                chat('video stream request from ' + socket.srcUser + ' timed out', ':', '#840', false, false)
                socket.emit('stream_video_refuse', { username: socket.srcUser, destination: socket.destUser })
            }
            closeRequestVideoDialog();
        }, 60000)
    }

    function closeRequestVideoDialog() {
        window.setTimeout(function(){
            document.getElementsByClassName('video-request-content')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('video-request-content')[0]
            .style.opacity = '0';
            window.setTimeout(function() {
                document.getElementsByClassName('video-request-dialog')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('video-request-dialog')[0]
                .style.height = '0';
                document.getElementsByClassName('video-request-dialog')[0]
                .style.opacity = '0';
                document.getElementsByClassName('video-request-dialog')[0]
                .style.marginTop = '0';
            }, 500)
        }, 200);
        socket.srcUser = '';
        socket.destUser = '';
        socket.requestVideoLock = false;
        message.focus()
    }

    function openVideoStreamDialog(data) {
        document.getElementsByClassName('video-stream-title')[0].innerHTML = 
            'on camera, ' + data.username + ' and ' + data.destination;
        window.setTimeout(function(){
            document.getElementsByClassName('video-stream-dialog')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('video-stream-dialog')[0]
            .style.height = '410px';
            document.getElementsByClassName('video-stream-dialog')[0]
            .style.opacity = '1';
            document.getElementsByClassName('video-stream-dialog')[0]
            .style.marginTop = '-205px';
            window.setTimeout(function() {
                beep();
                document.getElementsByClassName('video-stream-content')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('video-stream-content')[0]
                .style.opacity = '1';
            }, 500)
        }, 1000)
        stream_video_cancel.bind('click', function() {
            if (typeof socket.srcUser != 'undefined' && socket.srcUser != '') {
                chat('video stream canceled', ':', '#840', false, false)
                socket.emit('stream_video_refuse', { username: socket.srcUser, destination: socket.destUser })
            }
            closeVideoStreamDialog();
        });
    }

    function closeVideoStreamDialog() {
        window.setTimeout(function(){
            document.getElementsByClassName('video-stream-content')[0]
            .style.transition = 'all 0.5s';
            document.getElementsByClassName('video-stream-content')[0]
            .style.opacity = '0';
            window.setTimeout(function() {
                document.getElementsByClassName('video-stream-dialog')[0]
                .style.transition = 'all 0.5s';
                document.getElementsByClassName('video-stream-dialog')[0]
                .style.height = '0';
                document.getElementsByClassName('video-stream-dialog')[0]
                .style.opacity = '0';
                document.getElementsByClassName('video-stream-dialog')[0]
                .style.marginTop = '0';
            }, 500)
        }, 200);
        if (camera) clearInterval(streaming);
        socket.srcUser = '';
        socket.destUser = '';
        socket.streamVideoLock = false;
        message.focus()
    }
    
    socket.on('stream_video_request', function(data) {
        if (!socket.requestVideoLock) {
            socket.requestVideoLock = true;
            socket.srcUser = data.username;
            socket.destUser = data.destination;
            openRequestVideoDialog(data);
        }
    });

    socket.on('stream_video_accept', function(data) {
        socket.video = true;
        chat('video stream accepted', ':', '#663', false, false);
        if (!socket.streamVideoLock) {
            socket.streamVideoLock = true;
            socket.srcUser = data.username;
            socket.destUser = data.destination;
            openVideoStreamDialog(data);
            if (camera) streaming = setInterval(function(){
                viewVideo(video,context);
            }, 56);
        }
    });

    socket.on('stream_video', function(image){
        $('#video-stream').attr('src', image)
    });

    socket.on('stream_audio', function(data) {
        if (data) console.log('audio data!')
    });

    socket.connect('http://192.168.1.33:9999');

    socket.emit('hello', { username: username.html(), channel: channel.html() } );
    socket.on('reset', function() {
        socket.emit('hello', { username: username.html(), channel: channel.html() } );
    });

    var canvas = document.getElementById("preview");
    var context = canvas.getContext('2d');

    canvas.width = 260;
    canvas.height = 200;

    context.width = canvas.width;
    context.height = canvas.height;

    var video = document.getElementById("camera-stream");

    function loadCamera(stream) {
        video.src = window.URL.createObjectURL(stream);
        camera = true;
        console.log("Camera connected");
    }

    function loadFail() {
        console.log("Camera not connected");
    }

    function viewVideo(video,context) {
        if (socket.video) {
            context.drawImage(video, 0, 0, context.width, context.height);
            socket.emit('stream_video',
            {
                username: socket.srcUser,
                destination: socket.destUser,
                image: canvas.toDataURL('image/jpeg')
            });
        }
    }

    $(function() {
        console.log('Test if camera available');
        navigator.getUserMedia = ( navigator.getUserMedia
            || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia
            || navigator.msgGetUserMedia );
    
        if(navigator.getUserMedia){
            navigator.getUserMedia({video: true, audio: true},loadCamera,loadFail);
        }

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
