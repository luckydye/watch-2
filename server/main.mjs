import path from 'path';
import WebSocket from 'ws';
import express from 'express';
import watchApi from './api.js';
import http from 'http';
import WatchMessageHandler from './rooms/WatchMessageHandler.mjs';
import Connection from '@uncut/hotel/src/Connection.mjs';

const PORT = process.env.PORT || 8080;

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
app.use('/js', express.static('./client/js'));
app.use('/css', express.static('./client/css'));
app.use('/components', express.static('./client/components'));
app.use('/res', express.static('./resources'));

app.get('/', (req, res) => res.redirect("/" + randomRoomId()));

app.get('/rooms', (req, res) => {
    res.sendFile(path.resolve("./client/rooms.html"));
});

app.use('/api/v1', watchApi());

app.get('/r/:roomId', (req, res) => {
    res.redirect("/" + req.params.roomId);
});

app.get('/:roomId', (req, res) => {
    res.sendFile(path.resolve("./client/index.html"));
});

app.use((req, res, next) => {
    res.status(404);
    res.redirect("/");
});

server.listen(PORT, () => console.log('Watch 2 listening on port ' + PORT));
