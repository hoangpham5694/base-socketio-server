'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')

module.exports = class RoomHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
    }

    requestRoom(data) {
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        this.axiosClient = new AxiosHelper()
        //Todo: handle request join room

        this.axiosClient.request({
            url: format(routes.API_GO_HOME_FLIGHT, missionData.flight_id),
            method: 'PUT',
            data: data
        }, {
            done: () => {
                console.log('Call success API_GO_HOME_FLIGHT')
            },
            fail: () => {
                console.log('Error when call api API_GO_HOME_FLIGHT')
            }
        })

        // this.socket.emit(events.REQUEST_ROOM_SUCCEED_WEB, response.data.data.id)
    }

    requestLeaveRoom(data) {
        let room = data.room
        this.socket.leave(room);
        console.log(this.socket.rooms);
    }
}
