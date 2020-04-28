'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const SystemHandler = require('../handlers/systemHandler')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')

module.exports = class RoomHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
        this.systemHandler = new SystemHandler(this.socket, this.io)
    }

    requestRoom(room) {
        var data = {
            'channel' : room,
        };

        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        this.axiosClient = new AxiosHelper()
        var url = routes.API_CHECK_ROOM;

        this.axiosClient.request({
            url: url,
            method: 'POST',
            data: data
        }, {
            done: (response) => {
                console.log('Call success get room data');
                var roomData = response.data;
                var members = roomData.room_members;
                var joined = false;
                var currentUser = this.socket.client.user;
                members.forEach(function(member){
                    if(member.user_id === currentUser.user_id && member.user_type === currentUser.user_type){
                        joined = true;

                        this.socket.join(room);
                        console.log(this.socket.id + " join room " + room);
                    }
                }, this);
                if(!joined){
                   throw new Error();
                }
                this.systemHandler.responseSuccessNotification(notificationSuccess.JOIN_ROOM_SUCCESS);

            },
            fail: (error) => {
                console.log('Error when join room')
                this.systemHandler.responseErrorNotification(notificationError.JOIN_ROOM_ERROR);

            }
        })
    }

    requestLeaveRoom(data) {
        console.log(data);
        let room = data
        this.socket.leave(room);
        console.log(this.socket.rooms);
        this.systemHandler.responseSuccessNotification(notificationSuccess.LEAVE_ROOM_SUCCESS);
    }
}
