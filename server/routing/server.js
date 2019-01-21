const path = require('path');
const express = require('express');
const watchApi = require('./api.js');
const { randomRoomId } = require('../helper.js');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const socket = require('./socket.js')(io);

// Routing

http.listen(8080, () => console.log('App listening on port ' + 8080));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/node_modules/@webcomponents', express.static('node_modules/@webcomponents'));
app.use('/js', express.static('./client/js'));
app.use('/css', express.static('./client/css'));
app.use('/res', express.static('./resources'));

app.get('/', (req, res) => res.redirect("/" + randomRoomId()));

app.get('/rooms', (req, res) => {
	res.sendFile(path.resolve("./client/rooms.html"));
});

app.use('/api/v1', watchApi(io));

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
