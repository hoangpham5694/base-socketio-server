'use strict'

const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')


module.exports = class NormalEmitter {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
    }

    emitSeenMessage(roomName, roomMember){
        this.io.sockets.to(roomName).emit(events.RESPONSE_SEEN_MSG, {roomMember: roomMember});
    }


}
