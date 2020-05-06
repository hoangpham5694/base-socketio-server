'use strict'

const axios = require('axios')

module.exports = class AxiosHelper {
    constructor(token) {
        this.token = token
        this.configure()
    }

    configure() {
        this.setupAxios()
    }

    setupAxios() {
        this.configure = this.token ? {
            headers: {
                "Authorization": "Bearer " + this.token,
                "Content-Type": "application/json"
            }
        } : {}
    }

    setToken(token) {
        if (token !== undefined) {
            this.token = token
        }
    }

    request(request, callback = null) {
        let self = this

        let options = Object.assign({}, {headers: this.configure.headers}, request)


        axios(options)
            .then((data) => {
                callback && callback.done ? callback.done(data) : self.done(data, request)
            })
            .catch((error) => {
                console.log('Axios Error', error.message)
                callback && callback.fail ? callback.fail(error) : self.fail(error)
            })
    }

    done(data) {
        if (data.status === true && data.data.content) {
            console.log('CALL_API_SUCCEED')
        }
    }

    fail(error) {
        console.log('CALL_API_FAILED', error.message)
    }
}
