'use strict'

const serverComponent = require('../components/serverComponent')
const ServerInfoEmitter = require('../emitters/serverInfoEmitter')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')
const PgClient = require('../helpers/pgClient')
const NormalEmitter = require('../emitters/normalEmitter')
const DataParser = require('../helpers/dataParser')


module.exports = class SeenHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
        this.emitter = new NormalEmitter(this.io)
        this.serverInfoEmitter = new ServerInfoEmitter(this.socket, this.io)
        this.dataParser = new DataParser()
    }

    requestSeen(roomId) {
        var user = this.socket.client.user;
        var pgClient = new PgClient();

        pgClient.getRoomDataFromRoomId(roomId, {
            done: (result) => {
                var room = result;
                pgClient.updateSeenAt(roomId, user.user_id, user.user_type, {
                    done: (res)=>{
                        var roomMember = this.dataParser.parseRoomMember(res);
                        this.emitter.emitSeenMessage(room.channel, roomMember);
                    },
                    fail: (err) => {
                        new Error(err)
                    }
                })
            },
            fail: (err)=>{
                this.serverInfoEmitter.responseErrorNotification(notificationError.SEEN_MESSAGE_ERROR)
            }
        });
    }
}
