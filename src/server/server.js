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

		if(!room.hostId) {
			// set host to first user
			room.hostId = socket.id;
		} else {
			socket.emit('sync', room.state.video);
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
		broadcastToAll('message', { message: id + " added by " + username });

		if(room.queue.length < 2) {
			broadcastToAll('play video', { id });
		}
	});

	socket.on('queue remove', msg => {
		if(!room) return;
		const index = msg.index;
		room.queue.splice(index, 1);

		broadcastToAll('queue list', room.queue);
		broadcastToAll('message', { message: username + " removed " + msg.id });
	});

	socket.on('play video', msg => {
		if(!room) return;

		const vid = room.queue.splice(msg.index, 1);
		room.queue.unshift(vid);

		broadcastToAll('queue list', room.queue);
		broadcastToAll('play video', msg);
		broadcastToAll('message', { message: "Playing " + msg.id });
	});

	socket.on('player state', msg => {
		if(!room) return;
		const stateQueue = room.stateQueue;
		stateQueue.push(msg.state);
	});

	setInterval(() => {
		if(!room) return;
		const stateQueue = room.stateQueue;
		if(stateQueue.length > 0) {
			broadcast('player sync', stateQueue.shift());
		}
	}, 500);
});

http.listen(8080, () => console.log('App listening on port ' + 8080));