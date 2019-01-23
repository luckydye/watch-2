const Room = require('../rooms/Room.js');

module.exports = (io) => {
	Room.loadPlugins(io);

	return io.on('connection', socket => {

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
					state: room.state.video.state,
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
	
		on('reaction').then(msg => {
			room.broadcast('message', {
				message: msg.message,
				reaction: true,
			});
		});
	})
}
