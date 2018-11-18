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
		this.history = new Set();
		this.userlist = new Map();

		this.state = {
			service: null,
			video: {},
			saved: false,
		}
	}

	getRoomState() { return this.state; }

	socketConnected(socket) {
		this.userlist.set(socket.id, {
			username: socket.username,
			socket: socket,
		});

		if(!this.hostId || this.userlist.size < 1) {
			this.hostId = socket.id;
		}

		socket.emit('room state', {
			host: this.hostId == socket.id,
			saved: this.state.saved
		});

		this.resolveHost(socket);
	}

	socketDisconnected(socket) {
		this.userlist.delete(socket.id);
		if(this.userlist.size == 0) {
			if(!this.state.saved) {
				this.delete();
			}
		} else {
			this.resolveHost(socket);
		}
	}

	resolveHost(socket) {
		// find another host
		const currentHost = this.userlist.get(this.hostId);
		if(!currentHost) {
			const next = this.userlist.keys().next().value;
			console.log("Found new host from " + socket.id + " to " + next + " for " + this.id);
			this.hostId = next;

			const hostSocket = this.userlist.get(this.hostId).socket;
			hostSocket.emit('room state', {
				host: true,
				saved: this.state.saved
			});
		}
	}

	syncPlayerState(state) {
		const { timestamp, time, id } = state;
		this.state.video.id = id;
		this.state.video.time = time;
		this.state.video.timestamp = timestamp;
	}

	loadVideo(service, id) {
		this.broadcast('player state', {
			service: service,
			id: id,
			time: 0,
			state: 1,
		});
		// add to history
		this.addToHistory({ service, id });
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

	addToHistory(video) {
		for(let item of this.history) {
			if(item.id === video.id) return;
		}
		this.history.add(video);
		this.broadcast('history list', [...this.history]);
	}

	addToQueue(service, id) {
		this.queue.push({service, id});
        this.broadcast('queue list', this.queue);
		if(this.queue.length < 2) {
            this.loadVideo(service, id);
		}
	}

	removeFromQueue(index) {
		this.queue.splice(index, 1);
		this.broadcastQueue();
	}

	playFromQueue(index) {
		const service = this.queue[index].service;
		const id = this.queue[index].id;
		// move next vid up and play it
		const temp = this.queue.splice(index, 1)[0];
		this.queue.unshift(temp);
		this.loadVideo(service, id);

		this.removeFromQueue(1);
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
