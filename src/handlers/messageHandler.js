'use strict'

const AxiosHelper = require('../helpers/axios.js')
const format = require('string-format')
const routes = require('../constants/apis')
const events = require('../constants/events')
const serverComponent = require('../components/serverComponent')
const PgClient = require('../helpers/pgClient')
const SystemHandler = require('../handlers/systemHandler')
const notificationError = require('../constants/notificationError')
const notificationSuccess = require('../constants/notificationSuccess')
const RedisPubSub = require('../helpers/redisPubSub')


module.exports = class MessageHandler {
    constructor(socket, io) {
        this.socket = socket
        this.io = io
        this.socket.component = {}
        this.serverComponent = new serverComponent()
        this.systemHandler = new SystemHandler(this.socket, this.io)
    }

    requestSendMessage(data, room) {
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        this.sendMessagePromise(data, room).then(function(){
            console.log("send message success");
            this.systemHandler.responseSuccessNotification(notificationSuccess.SEND_MESSAGE_SUCCESS);

        }).catch(function(error){
           console.log("can not send message");
           this.systemHandler.responseErrorNotification(notificationError.SEND_MESSAGE_ERROR);
        }.bind(this))

    }
    sendMessagePromise(data, room){
        return new Promise((resolve, reject) =>{
            if(this.socket.rooms[room] ){
                this.getRoomData(room).then(function(roomData){

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
                            var userDataResponse = {
                                id: userData.id,
                                profile_image: userData.profile_image,
                                nick_name: userData.nick_name,
                            }
                            result.user = userDataResponse;
                            this.io.sockets.to(room).emit("receiver_message", {msg: result});
                            this.checkMemberForPushNoti(roomData);
                        },
                        fail: (error) => {
                            reject(error);
                        }
                    });

                }.bind(this)).catch(function(error){
                    console.log(error);
                    reject(error);
                })
            }else{
                reject(new Error("user not in room"));
            }
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
                redisPubSub.pushMessage(member);
            }
        }, this);
    }

    requestSeenMessage(data) {
        //Todo: handle request seen message
    }
}
