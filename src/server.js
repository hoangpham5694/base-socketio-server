'use strict'

const fs = require('fs')
const express = require('express')
const app = express()

let http, server

http = require('http')
server = http.createServer(app)

module.exports = server
