'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')

module.exports = class MessageHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
    }

    requestSendMessage(data) {
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        this.axiosClient = new AxiosHelper()
        //Todo: handle request send message

        this.axiosClient.request({
            url: format(routes.API_GO_HOME_FLIGHT, missionData.flight_id),
            method: 'PUT',
            data: data
        }, {
            done: () => {
                console.log('Call success')
            },
            fail: () => {
                console.log('Error')
            }
        })

        this.socket.emit(events.REQUEST_SEEN_MSG, response.data.data.id)
    }

    requestSeenMessage(data) {
        //Todo: handle request seen message
    }
}
