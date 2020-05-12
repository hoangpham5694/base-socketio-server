var redis = require('redis');
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const REDIS_KEY_USER = "socket:user:";
module.exports =  class RedisHelper{

    constructor(){

    }
    addUser(socketId, user) {
        redisClient.set(REDIS_KEY_USER + socketId, JSON.stringify(user), redis.print);
    }
    getUser(socketId, callback = null) {
        redisClient.get(REDIS_KEY_USER + socketId, function(err, reply){
            if(err){
                callback.fail(err);
                return;
            }
            callback.done(reply);
        });
    }
    isExistUser(socketId, callback = null){
        redisClient.get(REDIS_KEY_USER + socketId, function(err, reply){
            if(err){
                callback.done(false);
                return;
            }
            callback.done(true);
        })
    }
    removeUser(socketId){
        redisClient.del(REDIS_KEY_USER + socketId);
    }
}
