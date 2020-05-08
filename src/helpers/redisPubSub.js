var redisPubSub = require('redis');
var redisChannel = require('../constants/redisChannel')
var NormalEmitter = require('../emitters/normalEmitter')


const pub = redisPubSub.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const sub = redisPubSub.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

module.exports =  class RedisPubSub{

    pushMessage(pushDetail){
        pub.publish(redisChannel.CHANNEL_PUSH_NOTIFICATION, JSON.stringify(pushDetail));
    }

    subscribe(io){
        this.subscribeSystemMessage(io);
    }
    subscribeSystemMessage(io){
        sub.subscribe(redisChannel.CHANNEL_SYSTEM_MESSAGE);

        sub.on("message", function(channel, data){
            if(channel === redisChannel.CHANNEL_SYSTEM_MESSAGE){
                var data = JSON.parse(data);
                var message = data.message;
                var roomName = data.channel;
                var booking = data.booking;
                var normalEmitter = new NormalEmitter(io);
                normalEmitter.emitUpdateBooking(roomName, booking);
                normalEmitter.emitReceiverMessage(roomName, message);

            }

        }.bind(this))
    }
}
