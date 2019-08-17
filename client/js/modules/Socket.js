import { Notification } from "./Notifications.js";
import { Preferences } from "./Preferences.js";
import WatchClient from "./WatchClient.js";

function displayNotification(text, time) {
	const noti = new Notification({ type: Notification.TEXT, text, time });
	noti.display(document.querySelector("w2-notifications"));
}

let reconnecting;

export class Socket {

	get username() { return Preferences.get("username"); }

	isHost() {
		return this.host;
	}

	constructor() {
		this.client = new WatchClient();

		this.client.connect();

		this.updaterate = 500;
		this.host = false;

		this.room = null;
	}

	init() {
		const player = document.querySelector("w2-player");

		setInterval(() => {
			if (player.loaded) {
				this.client.emit('player.state', {
					service: player.service,
					time: player.getCurrentTime(),
					id: player.currentVideoId,
					timestamp: Date.now(),
					state: player.state
				});
			}
		}, this.updaterate);

		this.events = {

			'disconnect': () => {
				displayNotification("ERROR: Disconnected", 2000);

				if (!reconnecting) {
					reconnecting = setInterval(() => {
						if (!this.client.connectd) {
							this.client.connect();
						} else {
							this.connect(585882);
							clearInterval(reconnecting);
						}
					}, 1000);
				}
			},

			'message': msg => {
				displayNotification(msg.message, 2500);
			},

			'room.state': msg => {
				if (msg.host) {
					this.host = true;
				} else {
					this.host = false;
				}
			},

			'user.list': msg => {
				const userlist = document.querySelector("w2-itemlist.userlist");
				let users = msg.map(user => {
					const a = document.createElement("a");
					a.innerText = user.username;
					const tag = user.host ? "host" : "";
					return `${a.innerText} <span class="usertag ${tag}" title="${tag}"></span>`;
				})
				userlist.display(users);
			},

			'queue.list': msg => {
				const queue = document.querySelector("w2-videolist#queue");
				queue.list = msg;
				queue.render();
			},

			'history.list': msg => {
				const history = document.querySelector("w2-videolist#history");
				history.list = msg.reverse();
				history.render();
			},

			'player.state': data => {
				player.loadVideo({
					state: data.state,
					service: data.service,
					id: data.id,
					startSeconds: data.time + (data.timestamp ? 1 + ((Date.now() - data.timestamp) / 1000) : 0) + ((this.updaterate / 2) / 1000),
				}, data.state);
			},

			'play.video': () => {
				player.play();
			},

			'pause.video': () => {
				player.pause();
			},

			'seek.video': msg => {
				const currentTime = player.getCurrentTime();
				const diff = msg.time - currentTime;

				if (diff > 0.5 || diff < -0.5) {
					player.seekTo(msg.time);
					displayNotification(`Seeked ${Math.floor(diff)} seconds`, 2000);
				}
			},
		}

		this.initListeners(this.events);
	}

	initListeners(events) {
		for (let event in events) {
			this.client.on(event, msg => {
				events[event](msg);
			});
		}
	}

	emit(event, msg) {
		this.client.emit(event, msg);
	}

	connect(roomId) {
		const socket = this.client;

		this.room = roomId;

		socket.emit('join', {
			roomId: roomId,
			username: this.username
		});

		displayNotification("Connected", 2500);
	}

	addVideoToQueue(service, id) {
		this.client.emit('queue.add', { service, id });

		const queue = document.querySelector("w2-videolist#queue");
		return queue.list;
	}

	removeVideoFromQueue(video) {
		this.client.emit('queue.remove', {
			index: video.index,
			id: video.id
		});
	}

	loadVideo(video) {
		this.client.emit('queue.play', {
			index: video.index,
			id: video.id,
		});
	}
}