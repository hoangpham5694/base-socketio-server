'use strict'

const RoomHandler = require('./roomHandler')
const MessageHandler = require('./messageHandler')
const events = require('../constants/events')


module.exports = class BaseHandler {
    constructor (socket, io) {
        this.socket = socket
        this.io = io
        this.handlers = []

        this.setHandlers()
        this.room()
        this.message()

        // console.log('usingHashId', this.socket.usingHashId)
    }

    room () {
        let self = this
        this.socket.on(events.REQUEST_ROOM, (data) => {
            self.roomHandler.requestRoom(data)
        })
        this.socket.on(events.REQUEST_LEAVE_ROOM, (data) => {
            self.roomHandler.requestLeaveRoom(data)
        })
    }

    message () {
        let self = this
        this.socket.on(events.REQUEST_SEND_MSG, (data, room) => {
            self.messageHandler.requestSendMessage(data, room)
        })
        this.socket.on(events.REQUEST_SEEN_MSG, (data) => {
            self.messageHandler.requestSeenMessage(data)
        })
    }

    setHandlers () {
        this.roomHandler = new RoomHandler(this.socket, this.io)
        this.messageHandler = new MessageHandler(this.socket, this.io)
    }
}
