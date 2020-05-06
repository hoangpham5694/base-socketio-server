'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const SystemHandler = require('../handlers/systemHandler')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')
const PgClient = require('../helpers/pgClient')

module.exports = class RoomHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
        this.systemHandler = new SystemHandler(this.socket, this.io)
    }

    requestRoom(channel) {
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        var pgClient = new PgClient();
        pgClient.getRoomData(channel, {
            done: (roomData)=> {
                        var members = roomData.user;
                        var joined = false;
                        var currentUser = this.socket.client.user;
                        members.forEach(function(member){
                            if(parseInt(member.user_id ) === parseInt(currentUser.user_id) && member.user_type === currentUser.user_type){
                                joined = true;

                                this.socket.join(channel);
                                console.log(this.socket.id + " join room " + channel);
                            }
                        }, this);
                        if(!joined){
                           throw new Error();
                        }
                        this.systemHandler.responseSuccessNotification(notificationSuccess.JOIN_ROOM_SUCCESS);

            },
            fail : (error) => {

            }
        });
    }

    requestLeaveRoom(data) {
        console.log(data);
        let room = data
        this.socket.leave(room);
        console.log(this.socket.rooms);
        this.systemHandler.responseSuccessNotification(notificationSuccess.LEAVE_ROOM_SUCCESS);
    }
}
