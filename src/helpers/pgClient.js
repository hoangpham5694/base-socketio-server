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
        var result = await pool.query('Insert *** RETURNING *',
            []);

        var message = result.rows[0];

        callback.done(message);
        return;
    }


    timestameNow(){
        let date_ob = new Date().toISOString();
        return date_ob;
    }
}
