const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8084 });
let proxyIp = '';
let app = express();
let server;
let wsInst = null;

wss.on('connection', ws => {
    wsInst = ws;
    ws.on('message', message => {
        console.log(`Received message => ${message}`);
        proxyIp = message;
        restartServer();
    })
})

wss.on('close', () => {
    wsInst = null;
})

function restartServer() {
    if (server) {
        server.close(function() {
            setServer()
        });
    } else {
        setServer();
    }
}

function setServer() {
    //app.all('*', createProxyMiddleware({ target: proxyIp, changeOrigin: true }));
    app.get('/', (req, res) => {
        wsInst.send('test')
        return res.send('Received a GET HTTP method');
    });
    app.get('/feed', (req, res) => {
        wsInst.send('test')
        return res.send('Received a GET HTTP method');
    });
    server = app.listen(8085);
    console.log('Server restarted!');
}