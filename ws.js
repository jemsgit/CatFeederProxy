const WebSocket = require('ws');
const shortId = require('shortid');
const wsDebug = require('debug')('ws');
const resolverDebug = require('debug')('resolver');

shortId.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

function Ws(port) {
    this.responseList = {};
    this.wss = new WebSocket.Server({ port: port });
}

Ws.prototype.start = function() {
    this.wss.on('connection', ws => {
        ws.on('message', message => {
            wsDebug('message from esp', message);
            if (message.includes('id:')) {
                let id = message.slice(3, 12);
                let data = message.slice(12);
                this.resolveRequest(id, data.trim());
            }
            console.log(`Received message => ${message}`);
        })
    })

    this.wss.on('close', () => {
        console.log('ws closed');
    })
}

Ws.prototype.broadcast = function(data) {
    if (!this.wss) {
        return;
    }
    this.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

Ws.prototype.sendData = function(message) {
    let id = shortId.generate();
    wsDebug('send data');
    wsDebug(message + '+' + id);
    this.broadcast(message + '+' + id);
    return this.getResponse(id);
}

Ws.prototype.getResponse = function(id) {
    let resolve;
    let reject;
    let promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    resolverDebug('set resolver', id);
    this.responseList[id] = { resolve, reject };
    return promise;
}

Ws.prototype.resolveRequest = function(id, data) {
    resolverDebug(id);
    resolverDebug(data);
    resolverDebug(this.responseList[id]);
    if (this.responseList[id]) {
        this.responseList[id].resolve(data);
        this.responseList[id] = undefined;
    }
}

Ws.prototype.responseList = null;
Ws.prototype.wss = null;

module.exports = Ws;