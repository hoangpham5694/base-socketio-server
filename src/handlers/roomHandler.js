'use strict'

const serverComponent = require('../components/serverComponent')
const ServerInfoEmitter = require('../emitters/serverInfoEmitter')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')
const PgClient = require('../helpers/pgClient')

module.exports = class RoomHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
        this.serverInfoEmitter = new ServerInfoEmitter(this.socket, this.io)
    }

    requestRoom(roomName) {
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        var pgClient = new PgClient();
        new Promise((resolve, reject) => {
            pgClient.getRoomData(roomName, {
                done: (roomData)=> {
                    var members = roomData.user;
                    var joined = false;
                    var currentUser = this.socket.client.user;
                    members.forEach(function(member){
                        if(parseInt(member.user_id ) === parseInt(currentUser.user_id) && member.user_type === currentUser.user_type){
                            joined = true;

                            this.socket.join(roomName);
                            console.log(this.socket.id + " join room " + roomName);
                        }
                    }, this);
                    if(!joined){
                        reject(new Error())
                    }
                    resolve()

                },
                fail : (error) => {
                    reject(new Error())
                }
            });

        }).then(() => {
            this.serverInfoEmitter.responseSuccessNotification(notificationSuccess.JOIN_ROOM_SUCCESS);
        }).catch((error) => {
            this.serverInfoEmitter.responseErrorNotification(notificationError.JOIN_ROOM_ERROR);

        })


    }

    requestLeaveRoom(data) {
        console.log(data);
        let roomName = data
        this.socket.leave(roomName);
        console.log(this.socket.rooms);
        this.serverInfoEmitter.responseSuccessNotification(notificationSuccess.LEAVE_ROOM_SUCCESS);
    }
}
