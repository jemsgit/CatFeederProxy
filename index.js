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
let count = 0;
let lastMews = [{}, {}, {}];
let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))


wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received message => ${message}`);
    })
})

wss.on('close', () => {
    console.log('ws closed');
})

function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function hideIp(ip) {
    if (!ip) {
        return '****'
    }
    return ip.slice(0, 2) + '****' + ip.slice(-2);
}

function getPageParams() {
    return {
        count: count,
        mewEndpoint: config.host + ":" + config.port + '/',
        links: [{ text: 'This repo', url: 'https://github.com/jemsgit/CatFeederProxy' },
            { text: 'Cat Feeder repo', url: 'https://github.com/jemsgit/CatFeeder2' },
            { text: 'FrontEndDev Telegram channel', url: 'https://teleg.one/front_end_dev' },
            { text: 'Web Stack Telegram channel', url: 'https://teleg.one/web_stack' },
            { text: 'DrawBotArt Telegram channel', url: 'https://teleg.one/drawbot_art' },
        ],
        recentMessages: lastMews
    };
}

function setServer() {
    app.get('/', (req, res) => {
        return res.render('index', getPageParams());
    });
    app.post('/', (req, res) => {
        if (req.body.massage) {
            broadcast(req.body.massage);
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(ip)
            lastMews.unshift({ text: req.body.massage, sender: hideIp(ip) });
            lastMews = lastMews.slice(0, 3);
        }
        return res.render('index', getPageParams());
    });
    app.get('/feed', (req, res) => {
        broadcast('feed');
        count++;
        return res.send(count.toString());
    });
    server = app.listen(config.port);
    console.log('Server restarted!');
}

setServer();