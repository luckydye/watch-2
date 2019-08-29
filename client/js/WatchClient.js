import { Notification } from "./Notifications.js";
import { Preferences } from "./Preferences.js";

function displayNotification(text, time) {
	const noti = new Notification({ type: Notification.TEXT, text, time });
	noti.display(document.querySelector("w2-notifications"));
}

function displayReloadPrompt() {
	const ele = document.createElement('div');
	ele.className = "reload-prompt";
	ele.innerHTML = `
		<style>
			.reload-prompt {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 10000;
				padding: 20px;
				box-sizing: border-box;
				border-radius: 4px;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				background: rgba(0, 0, 0, 0.75);
				padding-bottom: 100px;
			}
		</style>
		<p>
			<h2>Something went wrong.</h2>
			<a>Please reload the page.</a>
		</p>
		<button onclick="location.reload()">Reload</button>
	`;
	document.body.appendChild(ele);
	return ele;
}

let reconnecting;

export class WatchClient {

	get username() { return Preferences.get("username"); }

	isHost() {
		return this.id === this.host;
	}

	constructor() {
		this.client = new HotelClient();

		this.client.connect();

		this.updaterate = 500;

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

				if (queue.list.length > 1 &&
					Preferences.get('autoplay') &&
					Math.floor(player.getCurrentTime()) >= Math.floor(player.getDuration())) {
					const queue = document.querySelector("w2-videolist#queue");
					this.loadVideo({
						index: 1,
						id: queue.list[1].id,
					});
				}
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
							this.connect(location.pathname);
							clearInterval(reconnecting);
							reconnecting = null;
						}
					}, 1000);
				} else {
					displayReloadPrompt();
				}
			},

			'join': msg => {
				this.id = msg.id;
			},

			'message': msg => {
				displayNotification(msg.message, 2500);
			},

			'room.state': msg => {
				this.host = msg.host;

				if (msg.hostonly) {
					document.querySelector('main').setAttribute('host-only', '');
				} else {
					document.querySelector('main').removeAttribute('host-only');
				}

				Preferences.set('hostonly', msg.hostonly);

				if (this.isHost()) {
					document.querySelector('main').setAttribute('host', '');
				} else {
					document.querySelector('main').removeAttribute('host');
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

export default class HotelClient {

	emit(type, data) {
		this.send({ type, data });
	}

	on(type, callback) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, []);
		}
		const arr = this.listeners.get(type);
		arr.push(callback);
	}

	constructor() {
		this.connectd = false;
		this.listeners = new Map();
		this.pingRate = 5000;
		this.pingTimer = null;
	}

	send(data) {
		if (this.connectd) {
			this.socket.send(JSON.stringify(data));
		}
	}

	sendBinary(data) {
		this.socket.send(data);
	}

	onMessage(e) {
		// console.log('[WebSocket] Message recieved', e);

		const listeners = this.listeners.get(e.type);
		if (listeners) {
			for (let listener of listeners) {
				listener(e.data);
			}
		}
	}

	ping() {
		this.send({ type: 'ping' });

		clearTimeout(this.pingTimer);
		this.pingTimer = setTimeout(this.ping.bind(this), this.pingRate);
	}

	onConnect(e) {
		console.log('[WebSocket] connected to', this.socket.url);

		this.ping();
	}

	onError(e) {
		console.log('[WebSocket] error on socket', e);

		displayReloadPrompt();
	}

	onClose(e) {
		console.log('[WebSocket] socket closed', e);

		const listeners = this.listeners.get('disconnect');
		if (listeners) {
			for (let listener of listeners) {
				listener(e.data);
			}
		}
	}

	connect() {
		return new Promise((resolve, reject) => {
			if (this.connectd) reject('already connected');

			this.protocol = location.protocol == "https:" ? "wss:" : "ws:";

			this.socket = new WebSocket(`${this.protocol}//${location.host}/`);

			this.socket.onmessage = e => {
				if (e.data instanceof Blob) {
					this.onMessage(e.data);
				} else {
					try {
						const json = JSON.parse(e.data);
						this.onMessage(json);
					} catch (err) {
						console.error('recieved unhandled response', err);
					}
				}
			};

			this.socket.onopen = e => {
				this.connectd = true;
				resolve(this.socket);
				this.onConnect(e);
			}

			this.socket.onerror = e => {
				this.connectd = false;
				reject('error connecting to socket');
				this.onError(e);
			}
			this.socket.onclose = e => {
				this.connectd = false;
				this.onClose(e);
			};
		})
	}

}
