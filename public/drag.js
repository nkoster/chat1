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
        if (!isResizing) return false;
        document.body.style.MozUserSelect="none";
        var offsetRight = container.width() - (e.clientX - container.offset().left);
        if (offsetRight < (container.width() - 5) && offsetRight > 5) {
            left.css('right', offsetRight);
            right.css('width', offsetRight);
            handle.css('right', offsetRight);
        }
        return false
    }).on('mouseup', function (e) {
        isResizing = false;
    });
});
