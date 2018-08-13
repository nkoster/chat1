var isResizing = false,
    lastDownX = 0;

$(function () {
    var container = $('#MIDDLE'),
        left = $('#chatroom'),
        right = $('#userlist'),
        handle = $('#drag');

    handle.on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientX;
    });

    $(document).on('mousemove', function (e) {
        // we don't want to do anything if we aren't resizing.
        if (!isResizing) 
            return false;
        
        var offsetRight = container.width() - (e.clientX - container.offset().left);

        left.css('right', offsetRight);
        right.css('width', offsetRight);
        handle.css('right', offsetRight);
        return false
    }).on('mouseup', function (e) {
        // stop resizing
        isResizing = false;
    });
});
