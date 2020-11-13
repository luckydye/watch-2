import path from 'path';
import WebSocket from 'ws';
import express from 'express';
import watchApi from './api.js';
import http from 'http';
import WatchMessageHandler from './rooms/WatchMessageHandler.mjs';
import Connection from '@uncut/hotel/src/Connection.mjs';

const PORT = process.env.PORT || 5500;

const app = express();
const server = http.Server(app);
const wss = new WebSocket.Server({ server: server });

// Hotel
const handler = new WatchMessageHandler;
const con = new Connection(wss, handler);

// Routing

function randomRoomId() {
    return Math.floor(Math.random() * 1000000).toString();
}

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/node_modules/@webcomponents', express.static('node_modules/@webcomponents'));
app.use('/js', express.static('./public/js'));
app.use('/css', express.static('./public/css'));
app.use('/components', express.static('./components'));
app.use('/res', express.static('./public'));

app.use('/', express.static('./public'));

app.get('/', (req, res) => res.redirect("/" + randomRoomId()));

app.use('/api/v1', watchApi());

app.get('/r/:roomId', (req, res) => {
    res.redirect("/" + req.params.roomId);
});

console.log('Dirname:', process.cwd());
console.log('Root:', path.resolve("./"));

app.get('/:roomId', (req, res) => {
    res.sendFile(path.resolve("./public/index.html"));
});

app.use((req, res, next) => {
    res.status(404);
    res.redirect("/");
});

server.listen(PORT, () => console.log('Watch 2 listening on port ' + PORT));
