const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

module.exports = class PgClient{
    createMessage (param, callback = null) {
        //const { name, email } = request.body
        pool.query('INSERT INTO messages (content, room_id, user_id, user_type, socket_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [param.content, param.room_id, param.user_id, param.user_type, param.socket_id, this.timestameNow()], (error, results) => {

            if (error) {
                callback.fail(error);
                return;
            }
            callback.done(results.rows[0]);
        })
    }



    timestameNow(){
        let date_ob = new Date();

        let date = ("0" + date_ob.getDate()).slice(-2);

        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        let year = date_ob.getFullYear();

        let hours = date_ob.getHours();

        let minutes = date_ob.getMinutes();

        let seconds = date_ob.getSeconds();

        return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
    }
}
