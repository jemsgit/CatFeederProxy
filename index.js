const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8084 });
let proxyIp = '';
let app = express();
let server;

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`);
    proxyIp = message;
    restartServer();
  })
})

function restartServer() {
    if(server) {
        server.close(function() {
            setServer()
        });
    } else {
        setServer();
    }
}

function setServer() {
    app.all('*', createProxyMiddleware({ target: proxyIp, changeOrigin: true }));
    server = app.listen(8085);
    console.log('Server restarted!');
}

