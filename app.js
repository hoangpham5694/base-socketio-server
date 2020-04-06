var app = require('express')();
const dotenv = require("dotenv");
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');
const redisAdapter = require('socket.io-redis');
const axios = require('axios');

dotenv.config();


app.get('/', function(req, res){
    res.send('<h1>Peasy</h1>');
});

io.adapter(redisAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));
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
    socket.on('send_message', function (from, msg, room='default') {
        if(socket.rooms[room] ){
            console.log('I received a private message by ', from, ' saying ', msg);
            io.sockets.to(room).emit("receiver_data", {from: from, msg: msg});
        }else{
            console.log("user not in room");
            messageToClient(socket.id, 'user_not_in_room', "user not in room");
        }


      // publisher.publish("peasy_database_content", JSON.stringify({from: from, msg: msg}));
    });
    socket.join('default');
    socket.on('room', function(room){
       // socket.leaveAll();

        axios({
            method: 'post',
            url: process.env.API_URL + 'v1/socket/check-chat-room',
            data: {
                channel: room,
            }
        }).then(function(response){

            var roomData = response.data;
            var members = roomData.room_members;
            var joined = false;

            members.forEach(function(member){
                var currentUser = socket.client.user;

                if(member.user_id === currentUser.user_id && member.user_type === currentUser.user_type){

                    joined = true;
                    console.log(socket.rooms);
                    socket.join(room);
                    messageToClient(socket.id, 'join_room_success', "join room success", {'room':room});
                    console.log(socket.id + " join room " + room);

                }
            });
            if(!joined){
                messageToClient(socket.id, 'join_room_failed', "join room faled");
            }
        }).catch(function(error){
            messageToClient(socket.id, 'join_room_failed', "join room faled");

        });


    });
    socket.on("new_connect", function(data){
        console.log("new connect");
        console.log(io.of("/").connected.length);

    });
});

function authenticate(socket, data, callback) {
    var accessToken = data.accessToken;

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