import Preferences from './Preferences.js';

export class Socket {

	get username() { return Preferences.get("username"); }

	constructor() {
		this.socket = io({
			reconnection: true,
		});

		this.roomid = location.pathname.replace("/r/", "");

		this.initListeners();
		this.connect();
	}

	initListeners() {
		const socket = this.socket;

		const player = document.querySelector("w2-player");
		const ytplayer = player.player;

		setInterval(() => {
			if(ytplayer.getPlayerState() == 1) {
				socket.emit('player state', {
					state: ytplayer.getPlayerState(),
				});
			}
		}, 500);
		
		socket.on('player sync', msg => {
			// set playert state
			console.log("msg");
		});

		socket.on('disconnect', msg => displayNotification("ERROR: Disconnected", 20000));
		
		socket.on('message', msg => displayNotification(msg.message, 2500));
		
		socket.on('user list', msg => {
			const userlist = document.querySelector("w2-itemlist.userlist");
			let users = msg.map(x => {
				return x[1];
			})
			userlist.display(users);
		});
		
		socket.on('queue list', msg => {
			const queue = document.querySelector("w2-queue");
			queue.queue = msg;
			queue.render();
		});
		
		socket.on('play video', msg => {
			const player = document.querySelector("w2-player");
			const ytplayer = player.player;
			ytplayer.cueVideoById(msg.id);
			ytplayer.playVideo();
		});
	}

	connect() {
		const socket = this.socket;

		socket.emit('join', {
			room: this.roomid,
			username: this.username
		});

		displayNotification("Connected", 2500);
	}

	addVideoToQueue(id) {
		this.socket.emit('queue add', { id });
	}

	removeVideoFromQueue(video) {
		this.socket.emit('queue remove', {
			index: video.index,
			id: video.id
		});
	}

	playVideo(video) {
		this.socket.emit('play video', {
			index: video.index,
			id: video.id
		});
	}
}