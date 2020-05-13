const axios = require('axios')
const routes = require('../constants/apis')

module.exports = class FireBaseHelper{
    constructor() {
        this.token = process.env.FIREBASE_SERVER_KEY
        this.configure()
    }

    configure() {
        this.setupAxios()
    }

    setupAxios() {
        this.configure = this.token ? {
            headers: {
                "Authorization": "key=" + this.token,
                "Content-Type": "application/json"
            }
        } : {}
    }
    pushToDeviceToken(data, deviceToken, callback = null) {
        let self = this
        var request = {
            url: routes.API_FIREBASE,
            method: 'POST',
            data: this.parseData(data, deviceToken)
        }
        let options = Object.assign({}, {headers: this.configure.headers}, request )


        axios(options)
            .then((response) => {
                callback && callback.done ? callback.done(response) : self.done(response, data)
            })
            .catch((error) => {
                console.log('Firebase Error', error.message)
                callback && callback.fail ? callback.fail(error) : self.fail(error)
            })
    }

    parseData(data, deviceToken){
        return {
            priority:"HIGH",
            data :data,
            notification:{
                body : data.title,
                title : data.message,
                icon : "ic_launcher"
            },
            registration_ids:[deviceToken]
        }
    }

}
