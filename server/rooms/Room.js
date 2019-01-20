// Plugins implementation
const pluginsFolder = global.pluginsFolder || "";
const plugins = {};

if(global.usedPlugins) {
	loadPlugins(global.usedPlugins);
}

function loadPlugins(pluginNameArr) {
	for(let plugin of pluginNameArr) {
		const Plugin = require('../' + pluginsFolder + plugin + '.js');
		plugins[plugin] = new Plugin();
		console.log('Plugin >', plugin, 'enabled.');
	}
}

function usePluginsFor(room, callback) {
	for(let pname in plugins) {
		const plugin = plugins[pname];
		
		if (!plugin.rooms ||
			plugin.rooms && plugin.rooms.includes(room.id)) {
			callback(plugin);
		}
	}
}

global.rooms = global.rooms || new Map();
const rooms = global.rooms;

module.exports = class Room {

	static getRoomStore() {
		return rooms;
	}
	
	static resolve(io, id) {
		if(rooms.has(id))
			return rooms.get(id);
		return new Room(io, id);
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

		usePluginsFor(this, plugin => {
			plugin.onCreate(this);
		});
	}

	getRoomState() { return this.state; }

	socketConnected(socket) {
		if(this.userlist.size < 1 && this.queue.length > 0) {
			console.log(this.queue.length);
			const vid = this.queue[0];
			this.loadVideo(vid.service, vid.id);
		}

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
		
		usePluginsFor(this, plugin => {
			plugin.onJoined(socket.username);
		});
	}

	socketDisconnected(socket) {
		this.userlist.delete(socket.id);
		if(this.userlist.size == 0) {
			if(!this.state.saved) {
				this.delete();
			}
		} else {
			this.resolveHost(socket);

			this.broadcast('message', {
				message: socket.username + " left"
			});

			usePluginsFor(this, plugin => {
				plugin.onLeft(socket.username);
			});
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

	syncPlayerState({ timestamp, time, id, service, state }) {
		this.state.video.service = service;
		this.state.video.id = id;
		this.state.video.time = time;
		this.state.video.timestamp = timestamp;
		this.state.video.state = state;
	}

	loadVideo(service, id) {
		this.broadcast('player state', {
			service: service,
			id: id,
			time: 0,
			state: 1,
		});
		// set video state
		this.syncPlayerState({ id, time: 0, timestamp: 0, });
		// add to history
		this.addToHistory({ service, id });
	}

	seekToVideo(time) {
		this.broadcast('seek video', { time });
	}

	playVideo() {
		this.state.video.state = 0;
		
		usePluginsFor(this, plugin => {
			plugin.onPlayVideo({
				service: this.state.service,
				id: this.state.video.id
			});
		});
	}

	pauseVideo() {
		this.state.video.state = 1;
		
		usePluginsFor(this, plugin => {
			plugin.onPauseVideo({
				service: this.state.service,
				id: this.state.video.id
			});
		});
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

		usePluginsFor(this, plugin => {
			plugin.onNewVideo({service, id});
		});
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
		
		usePluginsFor(this, plugin => {
			plugin.onSkipToVideo({service, id});
		});
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
