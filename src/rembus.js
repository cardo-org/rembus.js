import { encode, decode, Encoder, Tag } from 'cbor-x';
import { parse, stringify, v4 } from 'uuid';
import WebSocket from 'isomorphic-ws';
import { tableFromIPC, tableToIPC, Table } from 'apache-arrow';

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

if (!isBrowser) {
    const crypto = globalThis.crypto
}

const TYPE_IDENTITY = 0
const TYPE_PUBSUB = 1
const TYPE_RPC = 2
const TYPE_SETTING = 3
const TYPE_RESPONSE = 4
const TYPE_ATTESTATION = 11

const stsSuccess = 0x00;
const stsGenericError = 0x0A;
const stsChallenge = 0x0B;
const stsIdentificationError = 0x14;
const stsMethodException = 0x28;
const stsMethodNotFound = 0x2A;
const stsMethodUnavailable = 0x2B;
const stsMethodLoopback = 0x2C;
const stsTargetNotFound = 0x2D;
const stsTargetDown = 0x2E;
const stsTimeout = 0x46

export function component(url, secret) {
    return new Component(url, secret);
}

export class RembusError {
    constructor(status, reason) {
        this.status = status
        this.reason = reason
    }
    toString() {
        return { code: this.status, reason: this.reason }
    }
}

function toException(status, data) {
    return new RembusError(status, data)
}

// https://stackoverflow.com/questions/34673902/typescript-equivalent-to-dart-completer  
class Completer {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.complete = resolve;
            this.reject = reject;
        })
    }
}

function arrayToHex(byteArray) {
    return Array.from(byteArray, function (byte) {
        return '0x' + ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(' ')
}

function sign(challenge, secret) {
    let arr = new Uint8Array(challenge)
    let plain = encode([arr.buffer, secret])
    return crypto.subtle.digest("SHA-256", plain)
}

export function tag2table(data) {
    if (data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
            if (data[i] instanceof Tag && data[i].tag == 80) {
                data[i] = tableFromIPC(data[i].value)
            }
        }

    } else if (data instanceof Tag && data.tag == 80) {
        return tableFromIPC(data.value)
    };
    return data;
}

export function table2tag(data) {
    if (data instanceof Array) {
        let retvalue = []
        for (let i = 0; i < data.length; i++) {
            if (data[i] instanceof Table) {
                retvalue[i] = new Tag(tableToIPC(data[i]), 80)
            } else {
                retvalue[i] = data[i]
            }
        }
        return retvalue;
    } else if (data instanceof Table) {
        return new Tag(tableToIPC(data), 80)
    }
    return data
}

function responseSettler(message, completer) {
    let status = message[2]
    let data = tag2table(message[3])
    switch (status) {
        case stsSuccess:
            completer.complete(data);
            break;
        case stsChallenge:
            completer.complete(data);
            break;
        default:
            completer.reject(toException(status, data));
            break;
    }
}

function identitySettler(message, completer) {
    let status = message[2]
    let data = message[3]
    switch (status) {
        case stsSuccess:
            completer.complete(null);
            break;
        case stsChallenge:
            completer.complete(data);
            break;
        default:
            completer.reject(toException(status, data));
            break;
    }
}

class Component {
    constructor(url = null, secret) {
        if (URL.canParse(url)) {
            let uri = new URL(url)
            let protocol = uri.protocol.slice(0, -1)
            if (['ws', 'wss'].includes(protocol)) {
                this.protocol = protocol
                let cid = uri.pathname.slice(1)
                this.cid = (cid.trim() == '') ? null : cid
                this.host = uri.hostname
                this.port = uri.port
            } else {
                throw Error("invalid protocol")
            }
        } else {
            this.cid = url
            this.host = 'localhost'
            this.port = '8000'
            this.protocol = 'ws'
        }
        this.secret = secret
        this.handlers = new Map()
        this.reqres = {}
        this.encoder = new Encoder({ tagUint8Array: false })
    }

    get url() {
        return `${this.protocol}://${this.host}:${this.port}`
    }

    async connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = function open() {
            console.log("connection open")
        };

        this.socket.onclose = function (event) {
            console.log('connection closed, code:', event.code)
        };

        this.socket.onerror = function (event) {
            console.log('connection error, code:', event)
            //this.reason = event.message
        }

        this.socket.onmessage = async (event) => this.handleInput(event);

        let isconn = await this.isconnected();

        if (isconn) {

            if (this.cid !== null) {
                let challenge = await this.identity()
                if (challenge !== null) {
                    // console.log(`[${this.cid}] challenge: ${arrayToHex(challenge)}`)
                    await this.attestation(challenge)
                }
            }
        } else {
            throw (new RembusError(stsGenericError, this.reason));
        }
    }

    isOpened() {
        return (this.socket !== undefined) && this.socket.readyState === WebSocket.OPEN;
    }

    isClosed() {
        return this.socket.readyState === WebSocket.CLOSED;
    }

    async loopUntil(sts, timeout) {
        const intrasleep = 100
        const ttl = timeout / intrasleep // time to loop
        let loop = 0
        while (this.socket.readyState === sts && loop < ttl) {
            await new Promise(resolve => setTimeout(resolve, intrasleep))
            loop++
        }
    }

    async close(timeout = 5000) {
        if (!this.hasOwnProperty('socket'))
            return true;

        this.socket.close()

        if (this.socket.readyState !== WebSocket.CLOSING) {
            return this.isClosed()
        }
        else {
            await this.loopUntil(WebSocket.CLOSING, timeout);
            return this.isClosed()
        }
    }

    async isconnected(timeout = 5000) {
        if (this.socket.readyState !== WebSocket.CONNECTING) {
            return this.isOpened()
        }
        else {
            await this.loopUntil(WebSocket.CONNECTING, timeout);
            return this.isOpened()
        }
    }

    async handleInput(evt) {
        if (isBrowser) {
            var buff = await evt.data.arrayBuffer();
            var bufView = new Uint8Array(buff);
        } else {
            var bufView = new Uint8Array(evt.data);
        }
        //console.log('input<<:', arrayToHex(bufView));
        let payload = decode(bufView)
        //console.log('rembus msg: ', payload);
        let topic
        switch (payload[0]) {
            case TYPE_PUBSUB:
                topic = payload[1]
                if (this.handlers.has(topic)) {
                    if (this.context === undefined) {
                        //console.log(`recv [${topic}] pubsub`)
                        this.handlers.get(topic)(tag2table(...payload[2]))
                    } else {
                        this.handlers.get(topic)(this.context, tag2table(...payload[2]))
                    }
                }
                break;
            case TYPE_RESPONSE:
                var msgid = stringify(payload[1]);
                if (this.reqres.hasOwnProperty(msgid)) {
                    var status = payload[2];
                    var handle = this.reqres[msgid]
                    delete this.reqres[msgid];
                    clearTimeout(handle.timer)
                    handle.response(payload, handle.completer);
                }
                break;
            case TYPE_RPC:
                topic = payload[2];
                //console.log(`[${topic}]: ${payload[4]}`)
                if (this.handlers.has(topic)) {
                    let result
                    if (this.context === undefined) {
                        result = this.handlers.get(topic)(...tag2table(payload[4]));
                    } else {
                        result = this.handlers.get(topic)(this.context, ...tag2table(payload[4]));
                    }
                    await this.response(new Uint8Array(payload[1]), result);
                } else {

                }
                break;
        }
    }


    waitForResponse(id, settler = responseSettler) {
        const completer = new Completer();

        this.reqres[id] = {
            completer: completer,
            response: settler,
            timer: setTimeout(() => completer.reject(new RembusError(stsTimeout, "rembus timeout")), 1000)
        }
        return completer.promise;
    }

    async send(pkt) {
        //console.log('output>>:', arrayToHex(pkt));
        if (!this.isOpened())
            await this.connect();
        this.socket.send(pkt)
    }

    shared(context) {
        this.context = context
    }

    async rpc(topic) {
        const args = Array.prototype.slice.call(arguments, 1);
        let msgid = v4();
        let pkt = this.encoder.encode([TYPE_RPC, parse(msgid).buffer, topic, null, table2tag(args)]);
        await this.send(pkt);
        return this.waitForResponse(msgid);
    }

    async publish(topic) {
        const args = Array.prototype.slice.call(arguments, 1);
        let pkt = encode([TYPE_PUBSUB, topic, table2tag(args)]);
        this.send(pkt);
    }

    async identity() {
        let msgid = v4();
        let pkt = encode([TYPE_IDENTITY, parse(msgid).buffer, this.cid]);

        await this.send(pkt);
        return this.waitForResponse(msgid, identitySettler);
    }

    async attestation(challenge) {
        let msgid = v4();
        let signature = await sign(challenge, this.secret)
        // console.log(`signature: ${arrayToHex(new Uint8Array(signature))}`)
        let pkt = encode([TYPE_ATTESTATION, parse(msgid).buffer, this.cid, signature]);
        await this.send(pkt);
        return this.waitForResponse(msgid);
    }

    async response(msgid, result) {
        let pkt = encode([TYPE_RESPONSE, msgid.buffer, stsSuccess, result]);
        this.send(pkt);
    }

    async setreactive(sts) {
        let msgid = v4();
        let pkt = encode([TYPE_SETTING, parse(msgid).buffer, '__config__', { cmd: 'reactive', status: sts }]);
        await this.send(pkt);
        return this.waitForResponse(msgid);
    }

    async reactive() {
        return this.setreactive(true)
    }

    async unreactive() {
        return this.setreactive(false)
    }

    async subscribe(fn) {
        let msgid = v4();
        let pkt = encode([TYPE_SETTING, parse(msgid).buffer, fn.name, { cmd: 'subscribe' }]);
        await this.send(pkt);
        await this.waitForResponse(msgid);
        this.handlers.set(fn.name, fn)
    }

    async expose(fn) {
        let msgid = v4();
        let pkt = encode([TYPE_SETTING, parse(msgid).buffer, fn.name, { cmd: 'expose' }]);
        await this.send(pkt);
        await this.waitForResponse(msgid);
        this.handlers.set(fn.name, fn)
    }

    async unsubscribe(topic) {
        let fname = (topic.name === undefined) ? topic : topic.name;
        let msgid = v4();
        let pkt = encode([TYPE_SETTING, parse(msgid).buffer, fname, { cmd: 'unsubscribe' }]);
        await this.send(pkt);
        await this.waitForResponse(msgid);
        this.handlers.delete(fname)
    }

}

