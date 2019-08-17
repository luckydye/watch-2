import { Socket } from './Socket.js';
import Player from '../components/Player.js';
import { Notification } from './Notifications.js';

export class Room {

	static get id() {
		return location.pathname.replace("/r/", "");
	}

	constructor() {
		this.id = Room.id;

		this.player = new Player();
		document.querySelector(".player-container").appendChild(this.player);

		this.socket = new Socket();

		this.player.addEventListener("ready", () => {
			this.init();
		})

		this.initPlayer();
	}

	initPlayer() {
		this.player.setupPlayer();

		const socket = this.socket;
		const player = this.player;

		let lastState = 0;

		// player events
		this.player.addEventListener("statechange", (e) => {
			lastState = e.detail.state;
		})

		this.player.addEventListener("seek", (e) => {
			socket.emit('seek.video', { time: e.detail.time });
		})

		this.player.addEventListener("play", () => {
			socket.emit('play.video');
		})

		this.player.addEventListener("pause", () => {
			if (lastState !== Player.State.SEEKING) {
				socket.emit('pause.video');
				socket.emit('seek.video', { time: player.getCurrentTime() });
			}
		})
	}

	addVideo(link) {
		const parsed = parseVideoUrl(link);
		if (parsed) {
			this.socket.addVideoToQueue(parsed.service, parsed.id);
		} else {
			const noti = new Notification({ text: "Inavlid URL", time: 2000 });
			noti.display(document.querySelector("w2-notifications"));
		}
	}

	init() {
		const socket = this.socket;

		socket.init();

		document.querySelector(".video-queue w2-videolist#queue").removeVideo = (index, vid) => {
			socket.removeVideoFromQueue({ index, id: vid.id });
		}

		document.querySelector(".video-queue w2-videolist").playVideo = (index, vid) => {
			socket.loadVideo({ index, id: vid.id });
		}

		document.querySelector(".history w2-videolist").playVideo = (index, vid) => {
			const q = socket.addVideoToQueue(vid.service, vid.id);
			socket.loadVideo({ index: q.length, id: vid.id });
		}

		socket.connect(this.id);
	}

	setRoomState(obj) {
		this.socket.emit('room.state', obj);
	}

}