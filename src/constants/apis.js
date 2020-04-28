'use strict'

const API_BASE_URL = process.env.BASE_API_URL || 'https://your-api/v1'


module.exports = {
    API_BASE_URL: API_BASE_URL,
    API_CHECK_TOKEN: API_BASE_URL + 'v1/socket/check-device-token',
    API_CHECK_ROOM: API_BASE_URL + 'v1/socket/check-chat-room',
    API_SEND_MESSAGE: API_BASE_URL + 'v1/socket/send-message',
};
