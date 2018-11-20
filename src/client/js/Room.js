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

		const socket = this.socket;
		const player = this.player;
		
		let lastState = 0;
		let lastPlayerTime = 0;

		// check for seeking differences
		const tick = () => {
			if(lastState) {
				const currentTime = player.getCurrentTime();
				const diff = currentTime - lastPlayerTime;

				if(diff > 1) {
					socket.emit('seek video', { 
						time: player.getCurrentTime() 
					});
				}
	
				lastPlayerTime = currentTime;
			}

			requestAnimationFrame(tick);
		}
		
		// match player state to socket
		this.player.addEventListener("statechange", () => {
			const state = player.state;

			if(player.initState !== 1) {
				player.initState = state;
				lastState = state;
				tick();
				return;
			}

			switch(state) {
				case Player.State.PLAYING:
					socket.emit('play video');
					break;
				case Player.State.PAUSED:
					if(lastState !== Player.State.SEEKING) {
						socket.emit('pause video');
						socket.emit('seek video', { time: player.getCurrentTime() });
					}
					break;
				case Player.State.SEEKING:
					socket.emit('pause video');
					break;
			}

			lastState = state;
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
			socket.loadVideo({ index, id: vid.id });
		}

		document.querySelector(".history w2-videolist").playVideo = (index, vid) => {
			const q = socket.addVideoToQueue(vid.service, vid.id);
			socket.loadVideo({ index: q.length, id: vid.id });
		}

		// Room state
		document.querySelector("w2-preference-switch#saveRoom").onChange = (value) => {
			this.setRoomState({
				saved: value
			})
		}

		socket.connect(this.id);
	}

	setRoomState(obj) {
		this.socket.emit('room state', obj);
	}

}