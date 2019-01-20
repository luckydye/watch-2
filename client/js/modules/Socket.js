import { Notification } from "./Notifications.js";
import { Preferences } from "./Preferences.js";

let reactions = {};

fetch('/res/reactionEvents.json')
	.then(res => res.json()
	.then(json => {
		reactions = json;
	}))

function displayNotification(text, time) {
	const noti = new Notification({ type: Notification.TEXT, text, time });
	noti.display(document.querySelector("w2-notifications"));
}

function displayReaction(emote) {
	const noti = new Notification({ type: Notification.EMOTE, text: emote, time: 3000 });
	noti.display(document.querySelector("w2-notifications.reactions"));
}

export class Socket {

	get username() { return Preferences.get("username"); }

	isHost() {
		return this.host;
	}

	sendReaction(reaction) {
		this.emit('reaction', {
			message: reaction,
		})
	}

	constructor() {
		this.socket = io({
			reconnection: true,
		});

		this.updaterate = 500;
		this.host = false;
		this.connected = false;

		window.sendReaction = (emote) => {
			this.sendReaction(emote);
		}
	}

	init() {
		const player = document.querySelector("w2-player");

		setInterval(() => {
			if(player.loaded) {
				this.socket.emit('player state', {
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
				displayReaction(reactions.clientError);
				displayNotification("ERROR: Disconnected", 20000);
			},

			'message': msg => {
				if(msg.reaction) {
					displayReaction(msg.message);
				} else {
					displayNotification(msg.message, 2500);
				}
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
				player.loadVideo({
					service: msg.service,
					id: msg.id,
					startSeconds: msg.time + (msg.timestamp ? 1 + ((Date.now() - msg.timestamp)/1000) : 0) + ((this.updaterate/2)/1000),
				}, msg.state);
			},

			'play video': () => {
				player.play();
			},

			'pause video': () => {
				player.pause();
			},

			'seek video': msg => {
				const currentTime = player.getCurrentTime();
				const diff = msg.time - currentTime;

				if(diff > 0.5 || diff < -0.5) {
					player.seekTo(msg.time);
					displayNotification(`Seeked ${Math.floor(diff)} seconds`, 2000);
				}
			},
		}
		
		this.initListeners(this.events);
	}

	initListeners(events) {
		for(let event in events) {
			this.socket.on(event, msg => {
				events[event](msg);
			});
		}
	}

	emit(event, msg) {
		this.socket.emit(event, msg);
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

	addVideoToQueue(service, id) {
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

	loadVideo(video) {
		this.socket.emit('queue play', {
			index: video.index,
			id: video.id,
		});
	}
}