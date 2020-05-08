const { Pool, types } = require('pg')
const moment = require('moment')
const globalVariable = require('../constants/globalVariable')
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

// Disable automatic date parsing by node-postgres and parse dates in your application
// types.setTypeParser(1114, str => str)
// types.setTypeParser(1114, str => moment.utc(str).format())
types.setTypeParser(1114, str => moment.utc(str).toISOString())

module.exports = class PgClient{
    async createMessage (param, callback = null) {
        var result = await pool.query('INSERT INTO messages (content, room_id, user_id, user_type, socket_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [param.content, param.room_id, param.user_id, param.user_type, param.socket_id, this.timestameNow(), this.timestameNow()]);

        var message = result.rows[0];

        callback.done(message);
        return;
    }

    async getRoomData(channel, callback = null){
        var res = await pool.query('select rooms.* from rooms where rooms.channel = $1 limit 1',[channel]);
        if(res.rows.length > 0){
            var room = res.rows[0];
            var roomMembers = await pool.query('select * from room_members where room_id = $1',[room.id]);
            room.user = roomMembers.rows;
            callback.done(room);
            return;
        }
        callback.fail();
        return;

    }

    async checkAuthenticate(accessToken, callback = null){
        var res = await pool.query('select * from device_tokens where access_token = $1 limit 1',[accessToken]);
        if(res.rows.length > 0){
            var result = res.rows[0]
            var user = null;
            if(result.user_type === globalVariable.USER_OWNER){
                user = await pool.query('select * from owners where id = $1',[result.user_id]);
            }
            else{
                user = await pool.query('select * from sitters where id = $1',[result.user_id]);
            }

            result.user = user.rows[0];
            callback.done(result)
            return;
        }
        callback.fail()
        return;
    }



    timestameNow(){
        let date_ob = new Date().toISOString();
        return date_ob;
    }
}
