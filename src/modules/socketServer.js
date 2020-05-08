'use strict'

const bugsnag = require('bugsnag')
const socket = require('socket.io')
const BaseHandler = require('../handlers/baseHandler')
const routes = require('../constants/apis')
const AxiosHelper = require('../helpers/axios.js')
var redis = require('redis');
const redisAdapter = require('socket.io-redis');
const PgClient = require('../helpers/pgClient')

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
            timeout:process.env.AUTH_TIMEOUT
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
        sub.subscribe("peasy_database_system_message");

        sub.on("message", function(channel, data){
            if(channel === "peasy_database_system_message"){
                var data = JSON.parse(data);
                var message = data.message;
                var room = data.channel;
                var booking = data.booking;

                this.io.sockets.to(room).emit("update_booking", {
                    booking: booking});

                this.io.sockets.to(room).emit("receiver_message", {
                    msg: message});
            }

        }.bind(this))

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
        pgClient.checkAuthenticate(data.accessToken, {
            done: (data) => {
                socket.client.user = data;
                console.log("current socket: " + socket.id);
                for(var id in this.io.of("/").connected){
                    var s = this.io.of("/").connected[id];
                   // console.log(s);
                    if(s.client.user === undefined){
                        s.disconnect();
                        continue;
                    }
                    if(s.client.user.access_token === data.access_token && s.id !== socket.id){
                      //  console.log(s.client.user);
                        s.disconnect();
                    }
                }

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
