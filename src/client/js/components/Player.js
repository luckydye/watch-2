export default class Player extends HTMLElement {

	static get State() { return {
		EMPTY: 0,
		PLAYING: 1,
		PAUSED: 2,
		SEEKING: 3,
	}}

	get player() {
		if(this.currentService == "youtube.com") {
			return this.ytplayer;
		} else if(this.currentService == "twitch.tv") {
			return this.twitchplayer;
		}
	}

	get currentVideoId() {
		switch(this.currentService) {
			case "youtube.com": return this.player.getVideoData().video_id;
			case "twitch.tv": return this.player.getVideo();
		}
	}

	play() {
		switch(this.currentService) {
			case "youtube.com": return this.player.playVideo();
			case "twitch.tv": return this.player.play();
		}
	}

	pause() {
		switch(this.currentService) {
			case "youtube.com": return this.player.pauseVideo();
			case "twitch.tv": return this.player.pause();
		}
	}

	loadVideo({service, id, startSeconds}) {
		this.service = service;
		this.currentService = service;

		if(service == "youtube.com") {
			this.player.loadVideoById({
				videoId: id,
				startSeconds: startSeconds,
			});
			this.querySelector("#ytplayer").classList.add("active");
			this.querySelector("#twitchplayer").classList.remove("active");

		} else if(service == "twitch.tv") {
			this.player.setVideo(id, startSeconds);
			this.querySelector("#ytplayer").classList.remove("active");
			this.querySelector("#twitchplayer").classList.add("active");
		}
		
		this.initState = null;
	}

	seekTo(t) {
		switch(this.currentService) {
			case "youtube.com": return this.player.seekTo(t);
			case "twitch.tv": return this.player.seek(t);
		}
	}

	getCurrentTime() {
		return this.player.getCurrentTime();
	}

	static get template() {
		return `
			<div class="player" id="ytplayer"></div>
			<div class="active player" id="twitchplayer"></div>
		`;
	}

	constructor() {
		super();
		
		this.currentService = "youtube.com";
		this.initState = null;

		this.state = 0;

		this.ytplayer = null;
		this.twitchplayer = null;
	}

	connectedCallback() {
		this.innerHTML = this.constructor.template;
	}

	setupPlayer() {
		this.ytplayer = new YT.Player('ytplayer', {
			events: {
				'onStateChange': state => {
					this.onStateChange(state.data);
				},
				'onReady': () => {
					this.onReady();
				}
			}
		})

		this.twitchplayer = new Twitch.Player("twitchplayer", {
			channel: 'luckydye',
			height: 300,
			width: 400,
		});
		this.twitchplayer.addEventListener(Twitch.Player.PAUSE, () => {
			this.onStateChange(Player.State.PAUSED);
		})
		this.twitchplayer.addEventListener(Twitch.Player.PLAY, () => {
			this.onStateChange(Player.State.PLAYING);
		})
		this.twitchplayer.addEventListener(Twitch.Player.PLAYING, () => {
			this.onStateChange(Player.State.PLAYING);
		})
	}

	onReady() {
		this.dispatchEvent(new Event("ready"));
	}

	onStateChange(state) {
		this.state = state;
		this.dispatchEvent(new Event("statechange"));
	}
}

customElements.define("w2-player", Player);