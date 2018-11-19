export class Socket {

	get username() { return Preferences.get("username"); }

	constructor() {
		this.socket = io({
			reconnection: true,
		});

		this.updaterate = 500;
		this.host = false;

		this.connected = false;

		this.initState = null;
	}

	init() {
		const player = document.querySelector("w2-player");
		const ytplayer = player.player;

		this.events = {

			'disconnect': () => {
				displayNotification("ERROR: Disconnected", 20000)
			},

			'message': msg => {
				displayNotification(msg.message, 2500)
			},

			'room state': msg => {
				if(msg.host) {
					this.host = true;
					document.querySelector("#saveRoom").removeAttribute("disabled");
				} else {
					this.host = false;
					document.querySelector("#saveRoom").setAttribute("disabled", "");
				}
				if(msg.saved != null) {
					document.querySelector("#saveRoom input").checked = msg.saved;
				}
			},

			'user list': msg => {
				const userlist = document.querySelector("w2-itemlist.userlist");
				let users = msg.map(user => {
					const a = document.createElement("a");
					a.innerText = user.username;
					const tag = user.host ? "host" : "";
					return `${a.innerText} <span class="usertag ${tag}" title="${tag}"></span>`;
				})
				userlist.display(users);
			},

			'queue list': msg=> {
				const queue = document.querySelector("w2-videolist#queue");
				queue.list = msg;
				queue.render();
			},

			'history list': msg => {
				const history = document.querySelector("w2-videolist#history");
				history.list = msg.reverse();
				history.render();
			},

			'player state': msg => {
				ytplayer.loadVideoById({
					videoId: msg.id,
					startSeconds: msg.time + (msg.timestamp ? 1 + ((Date.now() - msg.timestamp)/1000) : 0) + ((this.updaterate/2)/1000),
				});
				this.initState = null;
			},

			'play video': () => {
				ytplayer.playVideo();
			},

			'pause video': () => {
				ytplayer.pauseVideo();
			},

			'seek video': msg => {
				const currentTime = ytplayer.getCurrentTime();
				const diff = msg.time - currentTime;

				if(diff > 0.5 || diff < -0.5) {
					ytplayer.seekTo(msg.time);
					displayNotification(`Resynced ${Math.floor(diff)} seconds`, 2000);
				}
			},
		}
		
		this.initListeners(this.events);
	}

	initListeners(events) {

		const player = document.querySelector("w2-player");
		const ytplayer = player.player;
		
		const socket = this.socket;

		setInterval(() => {
			if(ytplayer == null || !ytplayer.getPlayerState) return;
			if(ytplayer.getPlayerState() == 1) {
				socket.emit('player state', {
					time: ytplayer.getCurrentTime(),
					id: ytplayer.getVideoData().video_id,
					timestamp: Date.now(),
					ended: ytplayer.getPlayerState() == 0
				});
			}
		}, this.updaterate);

		for(let event in events) {
			socket.on(event, msg => {
				events[event](msg);
			});
		}
	}

	setRoomState(obj) {
		this.socket.emit('room state', obj);
	}

	connect(roomId) {
		const socket = this.socket;

		socket.emit('join', {
			room: roomId,
			username: this.username
		});

		displayNotification("Connected", 2500);

		this.connected = true;
	}

	addVideoToQueue(id) {
		const service = "youtube.com";
		this.socket.emit('queue add', { service, id });
		
		const queue = document.querySelector("w2-videolist#queue");
		return queue.list;
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