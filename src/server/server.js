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
app.use('/res', express.static('./src/client/res'));

app.use('/api/v1', require('./api.js'));

app.get('/', (req, res) => res.redirect("/r/" + randomRoomId()));

app.get('/r/:roomId', (req, res) => {
	res.sendFile(path.resolve("./src/client/index.html"));
});

// Socket

const rooms = new Map();

class Room {
	constructor(id) {
		rooms.set(id, this);

		this.id = id;
		this.queue = [];
		this.stateQueue = [];
		this.userlist = new Map();
		this.state = {
			video: {}
		}
	}

	delete() {
		rooms.delete(this.id);
	}

	static resolve(id) {
		if(rooms.has(id))
			return rooms.get(id);
		return new Room(id);
	}
}

io.on('connection', socket => {

	let room, 
		username = "unknown";

	function broadcastToAll(eventName, msg) {
		if(!room) return;
		io.to(room.id).emit(eventName, msg);
	}

	function broadcast(eventName, msg) {
		if(!room) return;
		socket.broadcast.to(room.id).emit(eventName, msg);
	}

	socket.on('join', msg => {
		// User joined room
		username = msg.username;
		room = Room.resolve(msg.room);
		room.userlist.set(socket.id, username);

		socket.join(room.id);

		broadcast('message', { message: username + " joined" });
		broadcastToAll('user list', [...room.userlist]);

		socket.emit('queue list', room.queue);

		if(room.state.video.id) {
			socket.emit('player state', {
				id: room.state.video.id,
				time: room.state.video.time,
				timestamp: room.state.video.timestamp,
				state: 1,
			});
		}

		if(!room.hostId) {
			// set host to first user
			room.hostId = socket.id;
		}
	});

	socket.on('disconnect', function() {
		// User left room
		if(!room) return;

		room.userlist.delete(socket.id);
		if(room.userlist.size == 0) {
			room.delete();
		}

		broadcast('message', { message: username + " left" });
		broadcastToAll('user list', [...room.userlist]);

		if(room.hostId == socket.id) {
			// find another host
			room.hostId == room.userlist.values().next().value;
			console.log("Found new host: " + room.hostId + " for " + room.id);
		}
	});

	// Queue stuff
	socket.on('queue add', msg => {
		if(!room) return;
		const id = msg.id;
		room.queue.push(id);

		broadcastToAll('queue list', room.queue);
		broadcast('message', { message: id + " added by " + username });

		if(room.queue.length < 2) {
			broadcastToAll('queue play', { id });
		}
	});

	socket.on('queue remove', msg => {
		if(!room) return;
		const index = msg.index;
		room.queue.splice(index, 1);

		broadcastToAll('queue list', room.queue);
		broadcast('message', { message: username + " removed " + msg.id });
	});

	socket.on('queue play', msg => {
		if(!room) return;
		const index = msg.index;
		room.queue.unshift(room.queue.splice(index, 1));

		socket.emit('player state', {
			id: msg.id,
			time: 0,
			state: room.state.video.state,
		});

		broadcastToAll('queue list', room.queue);
	});

	socket.on('play video', msg => {
		if(!room) return;
		room.state.video.state = 0;
		broadcastToAll('play video');
		broadcast('message', { message: username + " pressed play" });
	});

	socket.on('pause video', msg => {
		if(!room) return;
		room.state.video.state = 1;
		broadcastToAll('pause video');
		broadcast('message', { message: username + " pressed pause" });
	});

	socket.on('seek video', msg => {
		if(!room) return;
		broadcastToAll('seek video', { time: msg.time });
	});

	socket.on('player state', msg => {
		if(!room) return;
		if(socket.id === room.hostId) {
			room.state.video.time = msg.time;
			room.state.video.id = msg.id;
			room.state.video.timestamp = msg.timestamp;
		}
	});

	function skipToVideo(index) {
		room.queue.shift();
		const next = room.queue[0];

		broadcastToAll('queue list', room.queue);
		broadcastToAll('player state', {
			id: next,
			time: 0,
			state: 2,
		});
	}
});

http.listen(8080, () => console.log('App listening on port ' + 8080));
