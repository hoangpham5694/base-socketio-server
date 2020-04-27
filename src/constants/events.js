module.exports = {
    REQUEST_ROOM: 'room',
    REQUEST_LEAVE_ROOM: 'leave_room',
    REQUEST_SEND_MSG: 'send_message',
    REQUEST_SEEN_MSG: 'seen_message',

    DEFAULT_SOCKETIO_EVENTS: [
        'error',
        'connect',
        'connection',
        'disconnect',
        'disconnecting',
        'seen_message',
        'send_message',
        'room',
        'leave_room',
    ]
}
