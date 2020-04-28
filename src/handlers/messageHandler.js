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

    requestSendMessage(data, room) {
        this.socket.component = {}
        this.socket.component.server = this.serverComponent
        this.axiosClient = new AxiosHelper()
        this.sendMessagePromise(data, room).then(function(){
            console.log("send message");

        }).catch(function(error){
           console.log("can not send message");
           console.log("error");
        })

    }
    sendMessagePromise(data, room){
        return new Promise((resolve, reject) =>{
            if(this.socket.rooms[room] ){
                this.getRoomData(room).then(function(roomData){
                    this.callApiSendMessage(roomData,data).then(function(response){
                        this.io.sockets.to(room).emit("receiver_message", {
                            msg: response});
                        this.checkMemberForPushNoti(room);

                    }.bind(this)).catch(function(error){
                        reject(error)
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
            var roomDetail = this.io.sockets.adapter.rooms[room];
            var socketsInRoom = Object.keys(roomDetail.sockets);
            this.axiosClient.request({
                url: routes.API_CHECK_ROOM ,
                method: 'POST',
                data: {
                    'channel' : room,
                }
            },{
                done: (response)=>{
                    resolve(response.data)
                },
                fail: (error)=>{
                    reject(error)
                }
            });
        })
    }
    callApiSendMessage(roomData, msg){
         return new Promise((resolve, reject)=>{
             this.axiosClient.request({
                 url: routes.API_SEND_MESSAGE,
                 method: 'POST',
                 data: {
                     user_id : this.socket.client.user.user_id,
                     user_type : this.socket.client.user.user_type,
                     room_id: roomData.id,
                     socket_id : this.socket.id,
                     content: msg
                 }
             }, {
                 done: (response) => {
                     resolve(response.data);
                 },
                 fail: (error) => {
                     console.log('Error')
                     reject(error);

                 }
             })
         })
    }

    checkMemberForPushNoti(room){
        return new Promise((resolve, reject) => {
            var roomDetail = this.io.sockets.adapter.rooms[room];
            var socketsInRoom = Object.keys(roomDetail.sockets);
            this.axiosClient.request({
                url: routes.API_CHECK_ROOM,
                method: 'POST',
                data: {
                    'channel' : room,
                }
            }, {
                done: (response) => {
                    var members = response.data.room_members;
                    members.forEach(function(member){
                        var online = false;
                        socketsInRoom.forEach(function(item, index){
                            var socketInRoom = this.io.sockets.connected[item];
                            var clientUser = socketInRoom.client.user;

                            if(member.user_id === clientUser.user_id && member.user_type === clientUser.user_type){
                                online = true;
                            }
                        }, this);
                        if(!online && !(member === this.socket.client.user && member === this.socket.client.user)){
                            console.log("Push user " + member.user_id);
                            //TODO call push notification
                        }
                    }, this);
                },
                fail: (error) => {
                    console.log(error);
                    return reject();
                }
            })
            return resolve();
        })
    }

    requestSeenMessage(data) {
        //Todo: handle request seen message
    }
}
