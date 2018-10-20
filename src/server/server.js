const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const randomRoomId = () => "r" + Math.floor(Math.random() * 10000);

// Server

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/node_modules/@webcomponents', express.static('node_modules/@webcomponents'));
app.use('/js', express.static('./src/client/js'));
app.use('/css', express.static('./src/client/css'));

app.use('/api/v1', require('./api.js'));

app.get('/', (req, res) => res.redirect("/r/" + randomRoomId()));

app.get('/r/:roomId', (req, res) => {
	const room = req.params.roomId;
	res.sendFile(path.resolve("./src/client/index.html"));
	console.log(room);
});

// Socket

io.on('connection', socket => {
	console.log('a user connected');

	// all other users
	socket.broadcast.emit('user connected', { username: socket.conn.id });

	socket.on('disconnect', function() {
		console.log('user disconnected');
		
		socket.broadcast.emit('user disconnected', { username: socket.conn.id });
	});
});

http.listen(8080, () => console.log('App listening on port ' + 8080));