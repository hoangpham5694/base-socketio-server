'use strict'

const flat = require('flat')
const unflatten = require('flat').unflatten
const Hashids = require('hashids')

const hashid = new Hashids(process.env.HASHIDS_SALT || 'HASHIDS_KEY', parseInt(process.env.HASHIDS_LENGHT) || 16)

/**
 * EncodeId.
 *
 * @type {exports.encodeId}
 */
const encodeId = exports.encodeId = function encodeId(id) {
    return hashid.encode(id)
}

/**
 * DecodeId.
 *
 * @type {exports.decodeId}
 */
const decodeId = exports.decodeId = function decodeId(id) {
    return hashid.decode(id)[0]
}

/**
 * Detect object have key: (id, *_id).
 *
 * @type {exports.detectIfId}
 */
const detectIfId = exports.detectIfId = function detectIfId() {
    const string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''

    return (/(([a-z]+)_)?id(\W|$)/.test(string.toLowerCase())
    )
}

/**
 * Encode id => hashId
 *
 * @type {exports.encode}
 */
const encode = exports.encode = function encode() {
    let origin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}

    let response = {}

    origin = flat(origin)

    for (let prop in origin) {
        if (detectIfId(prop)) {
            response[prop] = encodeId(parseInt(origin[prop]))
        } else {
            response[prop] = origin[prop]
        }
    }

    return unflatten(response);
}

/**
 * Decode object hashId => id
 *
 * @type {exports.decode}
 */
const decode = exports.decode = function decode() {
    let origin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}

    let response = {}

    origin = flat(origin);

    for (let prop in origin) {
        if (detectIfId(prop) && typeof origin[prop] === 'string') {
            response[prop] = decodeId(origin[prop])
        } else {
            response[prop] = origin[prop]
        }
    }

    return unflatten(response)
}

/**
 * Check object have using hashId or not.
 *
 * @type {exports.usingHashId}
 */
const usingHashId = exports.usingHashId = function (client) {
    return (client.handshake.query.type !== undefined && client.handshake.query.type === 'hashid')
}

exports.default = {
    encodeId: encodeId,
    decodeId: decodeId,
    detectIfId: detectIfId,
    encode: encode,
    decode: decode,
    usingHashId: usingHashId
}
