import { WatchClient } from './WatchClient.js';
import Player from '../components/Player.js';
import { Notification } from './Notifications.js';
import { Service } from './Service.js';
import { PlayerInterface } from './PlayerInterface.js';
import { YouTube } from './services/ServiceYouTube.js';
import { Twitch } from './services/ServiceTwitch.js';
import { IFrames } from './services/ServiceIframe.js';
import { YouTubePlayer } from './players/YouTubePlayer.js';
import { TwitchPlayer } from './players/TwitchPlayer.js';
import { IFramePlayer } from './players/IFramePlayer.js';
import { Preferences } from './Preferences.js';

export class Room {

	static get id() {
		return location.pathname.replace("/r/", "");
	}

	constructor() {
		this.id = Room.id;

		Service.registerService(YouTube);
		Service.registerService(Twitch);
		Service.registerService(IFrames);

		this.player = new Player();
		document.querySelector(".player-container").appendChild(this.player);

		this.player.registerPlayerInterface(new YouTubePlayer('ytplayer'));
		this.player.registerPlayerInterface(new TwitchPlayer('twitchplayer'));
		this.player.registerPlayerInterface(new IFramePlayer('iframe'));

		this.socket = new WatchClient();

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

		function debounce(callback) {
			callback();
		}

		this.player.addEventListener("seek", (e) => {
			debounce(() => socket.emit('seek.video', { time: e.detail.time }));
		})

		this.player.addEventListener("play", () => {
			debounce(() => socket.emit('play.video'));
		})

		this.player.addEventListener("pause", () => {
			debounce(() => {
				if (lastState !== PlayerInterface.SEEKING) {
					socket.emit('pause.video');
					socket.emit('seek.video', { time: player.getCurrentTime() });
				}
			});
		})
	}

	addVideo(link) {
		const parsed = Service.parseServiceUrl(link);
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

		Preferences.subscribe((key, value) => {
			this.setRoomState({ hostonly: Preferences.get('hostonly') });
		})
	}

	setRoomState(obj) {
		this.socket.emit('room.state', obj);
	}

}