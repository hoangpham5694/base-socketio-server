'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const PgClient = require('../helpers/pgClient')
const ServerInfoEmitter = require('../emitters/serverInfoEmitter')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')
const RedisPubSub = require('../helpers/redisPubSub')
const NormalEmitter = require('../emitters/normalEmitter')
const DataParser = require('../helpers/dataParser')


module.exports = class MessageHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
        this.serverInfoEmitter = new ServerInfoEmitter(this.socket, this.io)
        this.normalEmitter = new NormalEmitter(this.io)
        this.dataParser = new DataParser()
    }

    requestSendMessage(data, roomName) {
        console.log("Handler:Send message")
        console.log(data)
        console.log(roomName)
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        this.sendMessagePromise(data, roomName).then(function(){
            console.log("send message success");
            this.serverInfoEmitter.responseSuccessNotification(notificationSuccess.SEND_MESSAGE_SUCCESS);

        }).catch(function(error){
           console.log("can not send message");
           this.serverInfoEmitter.responseErrorNotification(notificationError.SEND_MESSAGE_ERROR);
        }.bind(this))

    }
    sendMessagePromise(data, roomName){
        return new Promise((resolve, reject) =>{
            if(!this.socket.rooms[roomName] ){
                reject(new Error("user not in room"));
                return;
            }
            this.getRoomData(roomName).then(function(roomData){

                var pgClient = new PgClient();
                var param = {
                    room_id: roomData.id,
                    content: data,
                    user_id : this.socket.client.user.user_id,
                    user_type : this.socket.client.user.user_type,
                    socket_id : this.socket.id,
                };
                pgClient.createMessage(param, {
                    done: (result) => {
                        var userData = this.socket.client.user.user
                        result.user = this.dataParser.parseUserData(userData);
                        this.normalEmitter.emitReceiverMessage(roomName, result)
                        this.checkMemberForPushNoti(roomData);
                    },
                    fail: (error) => {
                        reject(error);
                    }
                });

            }.bind(this)).catch(function(error){
                reject(error);
            })
        })
    }
    getRoomData(room){
        return new Promise((resolve, reject)=>{
            var pgClient = new PgClient();
            pgClient.getRoomData(room, {
                done: (data) => {
                    resolve(data);
                },
                fail: () => {
                    console.log("get room data fail");
                    reject(new Error());
                }
            })
         })
    }


    checkMemberForPushNoti(roomData){
        var members = roomData.user;
        var roomDetail = this.io.sockets.adapter.rooms[roomData.channel];
        var socketsInRooms = Object.keys(roomDetail.sockets);

        members.forEach(function(member){
            var online = false;
            socketsInRooms.forEach(function(item, index){
                var socketInRoom = this.io.sockets.connected[item];
                var clientUser = socketInRoom.client.user;
                if(parseInt(member.user_id) === parseInt(clientUser.user_id) && member.user_type === clientUser.user_type){
                    online = true;
                }
            }, this);

            if(!online && !(member === this.socket.client.user && member === this.socket.client.user)){
                console.log("Push user " + member.user_id);
                var redisPubSub = new RedisPubSub();
                var pushDetail = new Object();
                pushDetail.roomMember = member;
                pushDetail.roomId = roomData.id;
                pushDetail.bookingId = roomData.booking_id;
                redisPubSub.pushMessage(pushDetail);
            }
        }, this);
    }

    requestSeenMessage(data) {
        //Todo: handle request seen message
    }
}
