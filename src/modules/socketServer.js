'use strict'

const bugsnag = require('bugsnag')
const socket = require('socket.io')
const BaseHandler = require('../handlers/baseHandler')
// const customParser = require('../helpers/customParser')

module.exports = class SocketServer {
    /*
     * SocketServer constructor
     */
    constructor (server, port) {
        this.port = port
        this.io = socket.listen(server, {
            // parser: customParser
        })
        this.handlers = []
        // this.bugsnag = bugsnag.register(process.env.BUGSNAG_API_KEY || )

        server.listen(this.port, (error) => {
            if (error) {
                throw new Error(error)
            } else {
                console.log('Server listen on port ' + `${this.port}`)
            }
        })

        this.io.on('connection', (socket) => this.onConnection(socket))
        this.io.on('error', (error) => this.onError(error))
    }

    /*
     * SocketServer onConnection event
     */
    onConnection (socket) {
        console.log('A client is connected socket server.')
        this.setHandlers(socket)

        socket.on('disconnect', this.onDisconnect)
    }

    /*
     * SocketServer onDisconnect event
     */
    onDisconnect () {
        console.log('A client is disconnected.')
    }

    setHandlers (socket) {
        this.baseHandler = new BaseHandler(socket, this.io)
    }

    onError (error) {
        // this.bugsnag.notify(new Error(error))
        console.log(error)
    }
}
