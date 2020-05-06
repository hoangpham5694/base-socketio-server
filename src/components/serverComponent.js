'use strict'

const _ = require('underscore')
const events = require('../constants/events')

function SocketServer () {
  this.clients = []
}

SocketServer.prototype = {
  /**
   * Add new client.
   *
   * @param client
   */
  addClient: function (client) {
    this.clients.push(client)
  },

  /**
   * Remove a client.
   *
   * @param socketID
   * @param clientSocket
   */
  removeClient: function (socketID, clientSocket) {
    let clientExist = _.findWhere(this.clients, {socketID: socketID})
    this.clients = this.clients.filter(function (t) {
      return t.socketID !== socketID
    })

    if (clientExist !== undefined && clientExist.id !== undefined) {
      //[Web] Call this event for Web client
      if (clientSocket !== undefined)
        clientSocket.emit(events.EVENT_APP_DRONE_FLIGHT_SUCCEED)
    }
  },

  /**
   * Get info all clients.
   *
   * @returns {{}}
   */
  getData: function () {
    let clientsData = {}
      clientsData.clients = this.clients

    return clientsData
  }
}

module.exports = SocketServer
