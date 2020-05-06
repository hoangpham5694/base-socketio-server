'use strict'

require('dotenv').config({path: '.env'})

// let debug = require('debug')('Express-Socket:server')
const server = require('./server')
const SocketServer = require('./modules/socketServer')


const port = process.env.SOCKET_PORT || 3000

function handle() {
    new SocketServer(server, port)
}

handle()
