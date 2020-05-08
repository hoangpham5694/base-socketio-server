'use strict'

const socket = require('socket.io')
const BaseHandler = require('../handlers/baseHandler')
var redis = require('redis');
const redisAdapter = require('socket.io-redis');
const PgClient = require('../helpers/pgClient')
const RedisPubSub = require('../helpers/redisPubSub')
const ServerHelper = require('../helpers/serverHelper')

const pub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const sub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);


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
        this.io.adapter(redisAdapter({pubClient: pub, subClient: sub}));
        this.authenticate = this.authenticate.bind(this);
        require('socketio-auth')(this.io, {
            authenticate: this.authenticate,
            postAuthenticate: this.postAuthenticate,
            disconnect: this.onDisconnect,
            timeout: process.env.AUTH_TIMEOUT
        });
        this.handlers = []
        // this.bugsnag = bugsnag.register(process.env.BUGSNAG_API_KEY || )

        server.listen(this.port, (error) => {
            if (error) {
                throw new Error(error)
            } else {
                console.log('Server listen on port ' + `${this.port}`)
            }
        })

        this.io.on('connection', (socket) => this.onConnection(socket, this.io))
        this.io.on('error', (error) => this.onError(error))
        var redisPubSub = new RedisPubSub();
        redisPubSub.subscribe(this.io)

    }

    /*
     * SocketServer onConnection event
     */


    onConnection (socket, io) {
        console.log('A client is connected socket server.')

        this.setHandlers(socket)

        socket.on('disconnect', this.onDisconnect)
    }

    /*
     * SocketServer onDisconnect event
     */
    onDisconnect (socket) {
        console.log(socket.id + ' is disconnected.')
    }

    setHandlers (socket) {
        this.baseHandler = new BaseHandler(socket, this.io)
    }

    onError (error) {
        // this.bugsnag.notify(new Error(error))
        console.log(error)
    }

    authenticate(socket, data, callback){
        var pgClient = new PgClient();
        pgClient.getUserFromAccessToken(data.accessToken, {
            done: (data) => {
                socket.client.user = data;
                ServerHelper.disconnectOldUser(socket, this.io)
                return callback(null, true);
            },
            fail: (error) => {
                console.log(error);
                return callback(new Error("token not found"));
            }
        })

    }

    postAuthenticate () {
      //  console.log("authenticated");
    }
}
