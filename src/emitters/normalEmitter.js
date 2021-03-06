'use strict'

const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')


module.exports = class NormalEmitter {
    constructor(io) {
        this.io = io
    }

    emitSeenMessage(roomName, roomMember){
        this.io.sockets.to(roomName).emit(events.RESPONSE_SEEN_MSG, {roomMember: roomMember});
    }

    emitReceiverMessage(roomName, message){
        this.io.sockets.to(roomName).emit(events.RESPONSE_RECEIVER_MESSSAGE, {
            msg: message});
    }
    emitUpdateBooking(roomName, booking){
        this.io.sockets.to(roomName).emit(events.RESPONSE_UPDATE_BOOKING, {
            booking: booking});
    }


}
