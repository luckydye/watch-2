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

		this.updaterate = 500;
	}

	initListeners() {
		const socket = this.socket;

		const player = document.querySelector("w2-player");
		const ytplayer = player.player;

		let lastState = null;
		let lastPlayState = 1;
		player.onStateChange = state => {
			if(lastState !== 1) {
				lastState = state.data;
				return;
			}

			switch(state.data) {
				case YT.PlayerState.PLAYING:
					socket.emit('play video');
					if(lastPlayState == YT.PlayerState.PAUSED) {
						socket.emit('seek video', { time: ytplayer.getCurrentTime() });
					}
					break;
				case YT.PlayerState.PAUSED:
					socket.emit('pause video');
					socket.emit('seek video', { time: ytplayer.getCurrentTime() });
					break;
				case YT.PlayerState.BUFFERING:
					socket.emit('seek video', { time: ytplayer.getCurrentTime() });
					break;
			}

			lastPlayState = state;
		}

		setInterval(() => {
			if(ytplayer.getPlayerState() == 1) {
				socket.emit('player state', {
					time: ytplayer.getCurrentTime(),
					id: ytplayer.getVideoData().video_id,
					timestamp: Date.now(),
					ended: ytplayer.getPlayerState() == 0
				});
			}
		}, this.updaterate);

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

		socket.on('player state', msg => {
			const player = document.querySelector("w2-player");
			const ytplayer = player.player;

			ytplayer.loadVideoById({
				videoId: msg.id,
				startSeconds: msg.time + (msg.timestamp ? 1 + ((Date.now() - msg.timestamp)/1000) : 0) + ((this.updaterate/2)/1000),
			});
			lastState = null;
		})
		
		socket.on('play video', msg => {
			// seperate play video and player state
			const player = document.querySelector("w2-player");
			const ytplayer = player.player;
			ytplayer.playVideo();
		});
		
		socket.on('queue play', msg => {
			// seperate play video and player state
			const player = document.querySelector("w2-player");
			const ytplayer = player.player;

			lastState = null;
			ytplayer.loadVideoById({
				videoId: msg.id,
				startSeconds: 0
			});
			ytplayer.playVideo();
			ytplayer.playVideo();
		});
		
		socket.on('pause video', msg => {
			const player = document.querySelector("w2-player");
			const ytplayer = player.player;
			ytplayer.pauseVideo();
		});
		
		socket.on('seek video', msg => {
			const player = document.querySelector("w2-player");
			const ytplayer = player.player;
			ytplayer.seekTo(msg.time);
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
		this.socket.emit('queue play', {
			index: video.index,
			id: video.id,
		});
	}
}