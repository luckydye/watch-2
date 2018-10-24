const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Room = require('./Room.js');
const { watchApi } = require('./api.js');

function randomRoomId() {
	return "r" + Math.floor(Math.random() * 10000);
}

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

app.use('/api/v1', watchApi(Room.getRoomStore()));

app.get('/', (req, res) => res.redirect("/r/" + randomRoomId()));

app.get('/r/:roomId', (req, res) => {
	res.sendFile(path.resolve("./src/client/index.html"));
});

// Socket

io.on('connection', socket => {

	let room, 
		username = "unknown";

	function broadcast(eventName, msg) {
		socket.broadcast.to(room.id).emit(eventName, msg);
	}

	function on(eventName) {
		let callback = () => {};
		const res = {
			then(cb) {
				callback = cb;
			} 
		};
		socket.on(eventName, msg => {
			if(room || eventName == "join" || eventName == "dic") {
				callback(msg);
			}
		});
		return res;
	}

	on('join').then(msg => {
		// User joined room
		username = msg.username;
		room = Room.resolve(io, msg.room);

		socket.join(room.id);
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

		room.userlist.set(socket.id, {
			username: username
		});
		
		broadcast('message', { message: username + " joined" });
		room.broadcastUserlist();
	});
	
	on('disconnect').then(() => {
		room.socketDisconnected(socket.id);
		room.broadcastUserlist();
		broadcast('message', { message: username + " left" });
	});

	on('queue add').then(msg => {
		room.addToQueue(msg.id);
		broadcast('message', { message: msg.id + " added by " + username });
	});

	on('queue remove').then(msg => {
		room.removeFromQueue(msg.index);
		broadcast('message', { message: username + " removed " + msg.id });
	});

	on('queue play').then(msg => {
		room.playFromQueue(msg.index, msg.id);
	});

	on('play video').then(msg => {
		room.playVideo();
		broadcast('message', { message: username + " pressed play" });
	});

	on('pause video').then(msg => {
		room.pauseVideo();
		broadcast('message', { message: username + " pressed pause" });
	});

	on('seek video').then(msg => {
		room.seekToVideo(msg.time);
	});

	on('player state').then(msg => {
		if(socket.id === room.hostId) {
			room.syncPlayerState(msg);
		}
	});

});

http.listen(8080, () => console.log('App listening on port ' + 8080));
