import Player from './components/Player.js';
import NetworkManager from './net/NetworkManager.js';
import { Notification } from './lib/Notifications.js';
import { PlayerInterface } from './players/PlayerInterface.js';
import { IFramePlayer } from './players/IFramePlayer.js';
import { TwitchPlayer } from './players/TwitchPlayer.js';
import { YouTubePlayer } from './players/YouTubePlayer.js';
import { Preferences } from './lib/Preferences.js';
import { Service } from './services/Service.js';
import { IFrames } from './services/ServiceIframe.js';
import { Twitch } from './services/ServiceTwitch.js';
import { YouTube } from './services/ServiceYouTube.js';
import { WatchClient } from './WatchClient.js';

const networkManager = new NetworkManager();

export class Room {

	static get id() {
		return location.pathname.replace("/r/", "");
	}

	constructor() {
		this.id = Room.id;

		Service.registerService(YouTube);
		Service.registerService(Twitch);
		Service.registerService(IFrames);

		this.client = new Client();
		this.player = new Player();
		document.querySelector(".player-container").appendChild(this.player);

		this.player.registerPlayerInterface(new YouTubePlayer('ytplayer'));
		this.player.registerPlayerInterface(new TwitchPlayer('twitchplayer'));
		this.player.registerPlayerInterface(new IFramePlayer('iframe'));

		this.socket = new WatchClient();

		networkManager.setClient(this.client, player);

		this.player.addEventListener("ready", () => {
			this.init();
		});

		this.initPlayer();
	}

	initPlayer() {
		this.player.setupPlayer();

		const player = this.player;

		let lastState = 0;

		// player events
		this.player.addEventListener("statechange", (e) => {
			lastState = e.detail.state;
		})

		function debounce(callback) {
			callback();
		}

		this.player.addEventListener("seek", (e) => {
			debounce(() => networkManager.seekVideo(e.detail.time));
			// debounce(() => socket.emit('seek.video', { time: e.detail.time }));
		})

		this.player.addEventListener("play", () => {
			debounce(() => networkManager.playVideo());
			// debounce(() => socket.emit('play.video'));
		})

		this.player.addEventListener("pause", () => {
			debounce(() => {
				if (lastState !== PlayerInterface.SEEKING) {
					networkManager.pauseVideo()
					networkManager.seekVideo(player.getCurrentTime());
					// socket.emit('pause.video');
					// socket.emit('seek.video', { time: player.getCurrentTime() });
				}
			});
		});
	}

	addVideo(link) {
		const parsed = Service.parseServiceUrl(link);
		if (parsed) {
			networkManager.addVideoToQueue(parsed.service, parsed.id);
			// this.socket.addVideoToQueue(parsed.service, parsed.id);
		} else {
			const noti = new Notification({ text: "Inavlid URL", time: 2000 });
			noti.display(document.querySelector("w2-notifications"));
		}
	}

	init() {
		const socket = this.socket;

		document.querySelector(".sidebar w2-videolist#queue").removeVideo = (index, vid) => {
			networkManager.removeVideoFromQueue({ index, id: vid.id });
			// socket.removeVideoFromQueue({ index, id: vid.id });
		}

		document.querySelector(".sidebar w2-videolist").playVideo = (index, vid) => {
			networkManager.loadVideo({ index, id: vid.id });
			// socket.loadVideo({ index, id: vid.id });
		}

		document.querySelector(".history w2-videolist").playVideo = (index, vid) => {
			const q = networkManager.addVideoToQueue(vid.service, vid.id);
			networkManager.loadVideo({ index: q.length, id: vid.id });
			// const q = socket.addVideoToQueue(vid.service, vid.id);
			// socket.loadVideo({ index: q.length, id: vid.id });
		}

		networkManager.connect(this.id);

		Preferences.subscribe((key, value) => {
			this.setRoomState({ hostonly: Preferences.get('hostonly') });
		});
	}

	setRoomState(obj) {
		networkManager.roomState(obj);
		// this.socket.emit('room.state', obj);
	}

}