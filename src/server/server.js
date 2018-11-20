const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Room = require('./Room.js');
const { watchApi } = require('./api.js');
const { randomRoomId } = require('./lib.js');

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

app.use('/api/v1', watchApi(io, Room));

app.get('/', (req, res) => res.redirect("/r/" + randomRoomId()));

app.get('/r/:roomId', (req, res) => {
	res.sendFile(path.resolve("./src/client/index.html"));
});

app.get('/rooms', (req, res) => {
	res.sendFile(path.resolve("./src/client/rooms.html"));
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

		socket.username = username;
		socket.join(room.id);
		socket.emit('queue list', room.queue);
		socket.emit('history list', [...room.history]);

		const videoid = room.state.video.id || room.queue[1];
		
		if(videoid) {
			socket.emit('player state', {
				service: room.state.video.service,
				id: videoid,
				time: room.state.video.time || 0,
				timestamp: room.state.video.timestamp || 0,
				state: 1,
			});
		}
		
		room.socketConnected(socket);

		broadcast('message', { message: username + " joined" });
		room.broadcastUserlist();
	});
	
	on('room state').then(msg => {
		if(room.hostId == socket.id) {
			room.state.saved = msg.saved;
		}
		broadcast('room state', room.getRoomState());
	});
	
	on('disconnect').then(() => {
		room.socketDisconnected(socket);
		room.broadcastUserlist();
		broadcast('message', { message: username + " left" });
	});

	on('queue add').then(msg => {
		room.addToQueue(msg.service, msg.id);
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
		broadcast('play video');
		broadcast('message', { message: username + " pressed play" });
	});

	on('pause video').then(msg => {
		room.pauseVideo();
		broadcast('pause video');
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
