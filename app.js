var app = require('express')();
const dotenv = require("dotenv");
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');
const redisAdapter = require('socket.io-redis');
const axios = require('axios');
dotenv.config();

const pub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const sub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);


app.get('/', function(req, res){
    res.send('<h1>Peasy</h1>');
});

io.adapter(redisAdapter({pubClient: pub, subClient: sub}));
const port = process.env.PORT;
http.listen(port, function(){
    console.log('listening on *:' + port);
});
require('socketio-auth')(io, {
    authenticate: authenticate,
    postAuthenticate: postAuthenticate,
    disconnect: disconnect,
    timeout:process.env.AUTH_TIMEOUT
});

io.on('connection', function (socket) {
    console.log("Socket:" + socket.id + "connect" );

    sub.subscribe("peasy_database_system_message");
    sub.on("message", function(channel, message){
        if(channel === "peasy_database_system_message"){
            var data = JSON.parse(message);
            var room = process.env.ROOM_ALIAS + data.room_id;
            io.sockets.to(room).emit("receiver_message", {
                msg: data});
        }
    })
    socket.on('seen_message', function(messageId) {
        seenMessage(socket, messageId).then(function (response){
            var room = process.env.ROOM_ALIAS + response.room_id;
            io.sockets.to(room).emit("seen_message_response", {
                message: response});
        }).catch(function (error){
            messageToClient(socket.id, error.code, error.message);
        });
    });

    socket.on('send_message', function (msg, room='default') {
        if(socket.rooms[room] ){
            var roomDetail = io.sockets.adapter.rooms[room];
            var socketsInRoom = Object.keys(roomDetail.sockets);
            checkChatRoom(socket, room).then(function(success){
                var members = success.room_members;

                members.forEach(function(member){
                    var online = false;
                    socketsInRoom.forEach(function(item, index){
                        var socketInRoom = io.sockets.connected[item];
                        var clientUser = socketInRoom.client.user;

                        if(member.user_id === clientUser.user_id && member.user_type === clientUser.user_type){
                            online = true;
                        }
                    });
                    if(!online && !(member === socket.client.user && member === socket.client.user)){
                        console.log("Push cho user " + member.user_id);
                    }
                });
                sendMessage(socket, success, msg).then(function (response){
                    io.sockets.to(room).emit("receiver_message", {
                        msg: response.data});
                }).catch(function(error){
                    messageToClient(socket.id, 'send_message_failed', "Error send message");
                });
            }).catch(function(error){
                messageToClient(socket.id, 'send_message_failed', "Error send message");
            })




        }else{
            console.log("user not in room");
            messageToClient(socket.id, 'user_not_in_room', "user not in room");
        }

    });
    socket.join('default');
    socket.on('room', function(room){
        checkChatRoom(socket, room).then(function (response){
            var roomData = response;
            var members = roomData.room_members;
            var joined = false;

            members.forEach(function(member){
                var currentUser = socket.client.user;

                if(member.user_id === currentUser.user_id && member.user_type === currentUser.user_type){
                    joined = true;
                    console.log(socket.rooms);
                    socket.join(room);
                    messageToClient(socket.id, 'join_room_success', "join room success", {'room':roomData});
                    console.log(socket.id + " join room " + room);
                }
            });
            if(!joined){
                messageToClient(socket.id, 'join_room_failed', "join room faled");
            }
        }).catch(function (error) {
            messageToClient(socket.id, 'join_room_failed', "join room faled");
        });

    });
    socket.on('leave_room', function(room){
        socket.leave(room);
        console.log(socket.rooms);
    });
});

function authenticate(socket, data, callback) {
    var accessToken = data.accessToken;
  //  console.log(accessToken);
    axios({
        method: 'post',
        url: process.env.API_URL + 'v1/socket/check-device-token',
        data: {
            access_token: data.accessToken,
        }
    }).then(function(response){
        return callback(null, true);
    }).catch(function(error){
        return callback(new Error("token not found"));
    });
}
function postAuthenticate(socket, data) {
    socket.client.user = null;
    console.log("post authenticate");
    axios({
        method: 'post',
        url: process.env.API_URL + 'v1/socket/check-device-token',
        data: {
            access_token: data.accessToken,
        }
    }).then(function(response){
        socket.client.user = response.data;
        //Disconnect old socket equal access_token
        for(var id in io.of("/").connected){
            var s = io.of("/").connected[id];

            if(s.client.user.access_token == response.data.access_token && s.id != socket.id){

                s.disconnect();
            }
        }

    }).catch(function(error){
        socket.disconnect();
    });
}
function disconnect(socket) {
    console.log(socket.id + ' disconnected');
}

function messageToClient(socketId ,code, message, data = null){
    msg = {
        'code': code,
        'message': message,
        'data': data
    };
    io.to(socketId).emit("system_message", msg);
    console.log("send message to "+ socketId);
}

function sendMessage(socket, roomData, msg){
   // console.log(socket.client.user.user_id);
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: process.env.API_URL + 'v1/socket/send-message',
            data: {
                user_id : socket.client.user.user_id,
                user_type : socket.client.user.user_type,
                room_id: roomData.id,
                socket_id : socket.id,
                content: msg
            }
        }).then(function(response){
            resolve(response);
        }).catch(function(error){
            reject(error.response.data);
        });


    });

}

function checkChatRoom(socket, room){
    return new Promise((relsove, reject) => {
        axios({
            method: 'post',
            url: process.env.API_URL + 'v1/socket/check-chat-room',
            data: {
                channel: room,
            }
        }).then(function(response){
            var roomData = response.data;
            relsove(roomData);
        }).catch(function(error){
            return reject(error.response.data)
        });
    });

}
function seenMessage(socket, messageId){
    console.log(messageId);
    return new Promise((relsove, reject) => {
        axios({
            method: 'post',
            url: process.env.API_URL + 'v1/socket/seen-message',
            data: {
                user_id: socket.client.user.user_id,
                user_type : socket.client.user.user_type,
                message_id : messageId
            }
        }).then(function(response){
            relsove(response.data);
        }).catch(function(error){
            return reject(error.response.data)
        });
    });
}