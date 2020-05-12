'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')

module.exports = class SystemHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
    }


    responseErrorNotification(code, message="", data=null){
        this.responseNotification(notificationError.NOTIFICATION_STATUS, code, message, data);
    }
    responseSuccessNotification(code, message="", data=null){
        this.responseNotification(notificationSuccess.NOTIFICATION_STATUS, code, message, data);
    }
    responseNotification(status, code, message, data=null){
        var socketId = this.socket.id;
        console.log(socketId);
        var msg = {
            'status': status,
            'code': code,
            'message': message,
            'data': data
        };
        this.io.to(socketId).emit("system_message", msg);
        console.log("Emitter:ServerInfoEmitter:To:"+ socketId);
        console.log("Emitter:ServerInfoEmitter:status:"+ msg.status);
        console.log("Emitter:ServerInfoEmitter:code:"+ msg.code);
    }

}
