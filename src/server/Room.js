const rooms = new Map();

module.exports = class Room {

	static getRoomStore() {
		return rooms;
	}
	
	static resolve(socket, id) {
		if(rooms.has(id))
			return rooms.get(id);
		return new Room(socket, id);
	}

	delete() {
		rooms.delete(this.id);
	}

	broadcast(eventName, msg) {
		this.socket.to(this.id).emit(eventName, msg);
	}

	constructor(socket, id) {
		rooms.set(id, this);

		this.socket = socket;
		this.id = id;
		this.queue = [];
		this.userlist = new Map();
		this.state = {
			video: {}
		}
	}

	socketDisconnected(socketId) {
		this.userlist.delete(socketId);
		if(this.userlist.size == 0) {
			// save rooms with "saved" in id
			if(!this.id.match('saved')) {
				this.delete();
			}
		} else {
			this.resolveHost(socketId);
		}
	}

	resolveHost(socketId) {
		// find another host
		if(this.hostId == socketId) {
			const next = this.userlist.keys().next().value;
			console.log("Found new host from " + socketId + " to " + next + " for " + this.id);
			this.hostId = next;
		}
	}

	syncPlayerState(state) {
		const { timestamp, time, id } = state;
		this.state.video.id = id;
		this.state.video.time = time;
		this.state.video.timestamp = timestamp;
	}

	loadVideo(id) {
		this.broadcast('queue play', { id });
	}

	seekToVideo(time) {
		this.broadcast('seek video', { time });
	}

	playVideo() {
		this.state.video.state = 0;
		this.broadcast('play video');
	}

	pauseVideo() {
		this.state.video.state = 1;
		this.broadcast('pause video');
	}

	addToQueue(id) {
		this.queue.push(id);
        this.broadcast('queue list', this.queue);
		if(this.queue.length < 2) {
            this.loadVideo(id);
		}
	}

	removeFromQueue(index) {
		this.queue.splice(index, 1);
		this.broadcastQueue();
	}

	playFromQueue(index) {
		const id = this.queue[index];
		// RODO: this might be wrong:
		this.queue.unshift(this.queue.splice(index, 1));
		this.broadcast('player state', {
			id: id,
			time: 0,
			state: 1,
		});
		this.broadcastQueue();
	}

	broadcastQueue() {
		this.broadcast('queue list', this.queue);
	}

	broadcastUserlist() {
		const list = [];
		for(let user of this.userlist) {
			list.push({
				username: user[1].username,
				host: user[0] == this.hostId
			})
		}
		this.broadcast('user list', list);
	}
}
