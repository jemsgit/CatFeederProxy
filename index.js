const express = require('express');
var bodyParser = require('body-parser');
const WS = require('./ws');
const reqDebug = require('debug')('req');
const helmet = require('helmet')

const config = {
    wsPort: 8084,
    host: 'http://localhost',
    port: 8085
}

let count = 0;
let lastMews = [{}, {}, {}];

let urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser = bodyParser.json();

const ws = new WS(config.wsPort);
let app = express();
app.set('view engine', 'ejs');
app.use(jsonParser)
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["*"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'"]
    }
}))
ws.start();


function hideIp(ip) {
    if (!ip) {
        return '****'
    }
    return ip.slice(0, 3) + '****' + ip.slice(-2);
}

function getPageParams() {
    return {
        count: count,
        mewEndpoint: config.host + ":" + config.port + '/',
        links: [{ text: 'This repo', url: 'https://github.com/jemsgit/CatFeederProxy' },
            { text: 'Cat Feeder repo', url: 'https://github.com/jemsgit/CatFeeder2' },
            { text: 'FrontEndDev Tg channel', url: 'https://teleg.one/front_end_dev' },
            { text: 'Web Stack Tg channel', url: 'https://teleg.one/web_stack' },
            { text: 'DrawBotArt Tg channel', url: 'https://teleg.one/drawbot_art' },
        ],
        recentMessages: lastMews
    };
}

function setServer() {
    app.get('/', (req, res) => {
        return res.render('index', getPageParams());
    });
    app.post('/', urlencodedParser, (req, res) => {
        let message = req.body.message;
        reqDebug(message)
        if (message) {
            ws.broadcast('print-' + message.replace(/[-]/g, '_'));
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            lastMews.unshift({ text: message, sender: hideIp(ip) });
            lastMews = lastMews.slice(0, 3);
        }
        return res.render('index', getPageParams());
    });
    app.get('/time', (req, res) => {
        reqDebug('get time req')
        ws.sendData('T-1')
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.get('/portion', (req, res) => {
        reqDebug('get portion req')
        ws.sendData('P-1')
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.get('/alarms', (req, res) => {
        reqDebug('get alarms req')
        ws.sendData('as-1')
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.post('/time', (req, res) => {
        reqDebug('set time req');
        reqDebug(req.body.value);
        ws.sendData('sT-' + req.body.value)
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.post('/addAlarm', (req, res) => {
        reqDebug('add alarm req');
        reqDebug(req.body.value);
        ws.sendData('adA-' + req.body.value)
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.post('/deleteAlarm/:id', (req, res) => {
        reqDebug('delete alarm req');
        reqDebug(req.params.id);
        ws.sendData('dA-' + req.params.id)
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.post('/portion', (req, res) => {
        reqDebug('set portion req');
        reqDebug(req.body.value);
        ws.sendData('sP-' + req.body.value)
            .then(function(data) {
                reqDebug('result');
                reqDebug(data);
                res.send(data.toString());
            })
            .catch(function(err) {
                res.send(400)
            })
    })
    app.get('/feed', (req, res) => {
        ws.broadcast('f-1');
        count++;
        return res.send(count.toString());
    });
    server = app.listen(config.port);
    console.log('Server restarted!');
}

setServer();