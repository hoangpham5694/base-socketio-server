'use strict'

const bugsnag = require('bugsnag')
const socket = require('socket.io')
const BaseHandler = require('../handlers/baseHandler')
const routes = require('../constants/apis')
const AxiosHelper = require('../helpers/axios.js')

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
    authenticate (socket, data, callback) {
        this.axiosClient = new AxiosHelper();
        let self = this;

        var accessToken = data.accessToken;
        var url= routes.API_CHECK_TOKEN;
        this.axiosClient.request({
            url: url,
            method: 'POST',
            data: {
                access_token: data.accessToken
            }
        }, {
            done: (response) => {
                socket.client.user = response.data;
                console.log("current socket: " + socket.id);
                for(var id in this.io.of("/").connected){
                    var s = this.io.of("/").connected[id];
                   // console.log(s);
                    if(s.client.user === undefined){
                        s.disconnect();
                        continue;
                    }
                    if(s.client.user.access_token == response.data.access_token && s.id != socket.id){
                      //  console.log(s.client.user);
                        s.disconnect();
                    }
                }

                return callback(null, true);
            },
            fail: (error) => {
                console.log('Error')
                console.log(error);
                return callback(new Error("token not found"));
            }
        })
    }
    postAuthenticate () {
      //  console.log("authenticated");



    }
}
