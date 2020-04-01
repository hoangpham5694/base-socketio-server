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
        console.log('I received a private message by ', from, ' saying ', msg);
        io.sockets.in(room).emit("receiver_data", {from: from, msg: msg});
      // publisher.publish("peasy_database_content", JSON.stringify({from: from, msg: msg}));
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
        console.log("authen success");
        return callback(null, true);
    }).catch(function(error){
        console.log("authen not success");
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
        console.log(response.data);
    }).catch(function(error){
      //  console.log(error);
    });
}
function disconnect(socket) {
    console.log(socket.id + ' disconnected');
}