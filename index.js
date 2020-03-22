const express = require('express');
var bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const path = require('path');

const config = {
    wsPort: 8084,
    host: 'http://localhost',
    port: 8085
}

const wss = new WebSocket.Server({ port: config.wsPort });
let proxyIp = '';
let server;
let count = 25;
let app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))


wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received message => ${message}`);
        proxyIp = message;
    })
})

wss.on('close', () => {
    console.log('ws closed')
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
    let pageParams = {
        count: count,
        mewEndpoint: config.host + ":" + config.port + '/mew',
        links: [{ text: 'This repo', url: 'https://github.com/jemsgit/CatFeederProxy' },
            { text: 'Cat Feeder repo', url: 'https://github.com/jemsgit/CatFeeder2' },
            { text: 'FrontEndDev Telegram channel', url: 'https://t.me/front_end_dev' },
            { text: 'Web Stack Telegram channel', url: 'https://t.me/web_stack' },
            { text: 'DrawBot art Telegram channel', url: 'https://t.me/drawbot_art' },
        ]
    }
    app.get('/', (req, res) => {
        return res.render('index', pageParams);
    });
    app.post('/mew', (req, res) => {
        if (req.body.massage) {
            wss.broadcast(req.body.massage);
        }
        return res.render('index', pageParams);
    });
    app.get('/feed', (req, res) => {
        wss.broadcast('feed');
        count++;
        return res.send(count.toString());
    });
    server = app.listen(config.port);
    console.log('Server restarted!');
}

setServer();