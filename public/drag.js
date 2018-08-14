let
    isResizing = false,
    lastDownX = 0;

$(() => {
    let
        container = $('#MIDDLE'),
        left = $('#chatroom'),
        right = $('#userlist'),
        handle = $('#drag');

    handle.on('mousedown', e => {
        isResizing = true;
        lastDownX = e.clientX
    });

    $(document).on('mousemove', e => {
        if (!isResizing) return false;
        document.body.style.MozUserSelect = "none";
        var offsetRight = container.width() - (e.clientX - container.offset().left);
        if (offsetRight < (container.width() - 5) && offsetRight > 5) {
            left.css('right', offsetRight);
            right.css('width', offsetRight);
            handle.css('right', offsetRight)
        }
        return false
    }).on('mouseup', e => {
        isResizing = false
    })
});
