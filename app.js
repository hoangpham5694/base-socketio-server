var app = require('express')();
const dotenv = require("dotenv");
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');
const redisAdapter = require('socket.io-redis');

dotenv.config();


app.get('/', function(req, res){
    res.send('<h1>Peasy</h1>');
});

io.adapter(redisAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));
const port = process.env.PORT;
http.listen(port, function(){
    console.log('listening on *:' + port);
});
io.on('connection', function (socket) {
    console.log("Socket:" + socket.id + "connect" );
});

