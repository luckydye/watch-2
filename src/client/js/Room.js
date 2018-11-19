import { Socket } from './Socket.js';
import Player from './components/Player.js';

export class Room {

	constructor() {
		this.id = location.pathname.replace("/r/", "");

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

		let lastPlayState = 1;

		const socket = this.socket.socket;
		
		this.player.addEventListener("statechange", () => {
			const player = this.player;
			const state = player.state;
			
			if(player.initState !== 1) {
				player.initState = state;
				return;
			}

			switch(state) {
				case 1:
					socket.emit('play video');
					if(lastPlayState == 2) {
						socket.emit('seek video', { time: player.getCurrentTime() });
					}
					break;
				case 2:
					socket.emit('pause video');
					socket.emit('seek video', { time: player.getCurrentTime() });
					break;
				case 3:
					socket.emit('seek video', { time: player.getCurrentTime() });
					break;
			}

			lastPlayState = state;
		})
	}

	init() {
		const socket = this.socket;
		
		socket.init();
		
		const input = document.querySelector(".addToQueueDialog input");
		document.querySelector(".addToQueueDialog button").addEventListener("click", () => {
			const link = input.value;
			if(!link) return;

			const parsed = parseVideoUrl(link);
			if(parsed) {
				socket.addVideoToQueue(parsed.service, parsed.id);
			} else {
				displayNotification("Inavlid URL", 2000);
			}
			document.body.setAttribute("queue-add-dialog", "false");
			input.value = "";
		})

		document.querySelector(".video-queue w2-videolist#queue").removeVideo = (index, vid) => {
			socket.removeVideoFromQueue({ index, id: vid.id });
		}

		document.querySelector(".video-queue w2-videolist").playVideo = (index, vid) => {
			socket.playVideo({ index, id: vid.id });
		}

		document.querySelector(".history w2-videolist").playVideo = (index, vid) => {
			const q = socket.addVideoToQueue(vid.service, vid.id);
			socket.playVideo({ index: q.length, id: vid.id });
		}

		// Room state
		document.querySelector("w2-preference-switch#saveRoom").onChange = (value) => {
			socket.setRoomState({
				saved: value
			});
		}

		socket.connect(this.id);
	}

}