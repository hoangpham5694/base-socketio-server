var redisPubSub = require('redis');


const pub = redisPubSub.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const sub = redisPubSub.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

module.exports =  class RedisPubSub{
    pushMessage(roomMember){
        pub.publish("peasy_database_push_notification", JSON.stringify(roomMember));
    }
}
