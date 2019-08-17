export default class Player extends HTMLElement {

	static get template() {
		return `
			<div class="player" id="ytplayer"></div>
			<div class="active player" id="twitchplayer"></div>
		`;
	}

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
		return this.video.id;
	}

	play() {
		if(this.state !== Player.State.PLAYING) {
			switch(this.currentService) {
				case "youtube.com": return this.player.playVideo();
				case "twitch.tv": return this.player.play();
			}
		}
	}

	pause() {
		if(this.state !== Player.State.PAUSED) {
			switch(this.currentService) {
				case "youtube.com": return this.player.pauseVideo();
				case "twitch.tv": return this.player.pause();
			}
		}
	}

	loadVideo({service, id, startSeconds}, state) {
		if(this.loaded) {
			this.pause();
		}
		
		this.loaded = false;
			
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
			this.player.setVideo("v" + id, startSeconds);
			this.querySelector("#ytplayer").classList.remove("active");
			this.querySelector("#twitchplayer").classList.add("active");
		}

		if(state == Player.State.PAUSED) {
			this.pause();
		}

		this.video.id = id;
		this.video.service = service;
	}

	seekTo(t) {
		switch(this.currentService) {
			case "youtube.com": return this.player.seekTo(t);
			case "twitch.tv": return this.player.seek(t);
		}
	}

	getCurrentTime() {
		if(this.player && this.player.getCurrentTime) {
			return this.player.getCurrentTime();
		} else {
			return 0;
		}
	}

	constructor() {
		super();
		
		this.currentService = "youtube.com";
		this.loaded = false;

		this.state = 0;

		this.ytplayer = null;
		this.twitchplayer = null;

		this.video = {
			id: null,
		}
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

		this.twitchplayer = new Twitch.Player("twitchplayer");
		this.twitchplayer.addEventListener(Twitch.Player.PAUSE, () => {
			this.onStateChange(Player.State.PAUSED);
		})
		this.twitchplayer.addEventListener(Twitch.Player.PLAYING, () => {
			this.onStateChange(Player.State.PLAYING);
		})
		
		let lastPlayerTime = 0;

		const tick = () => {
			const currentTime = this.getCurrentTime();
			if(this.loaded) {
				if(lastPlayerTime > 1) {
					const diff = currentTime - lastPlayerTime;
					if(Math.abs(diff) > 1) {
						this.dispatchEvent(new CustomEvent("seek", {
							detail: { time: currentTime }
						}));
					}
				}
				lastPlayerTime = currentTime;
			}
			requestAnimationFrame(tick);
		}
		tick();
	}

	onReady() {
		this.dispatchEvent(new CustomEvent("ready"));
	}

	onStateChange(state) {
		this.state = state;

		if(this.loaded) {
			switch(state) {
				case Player.State.PLAYING:
					this.dispatchEvent(new CustomEvent("play"));
					break;
				case Player.State.PAUSED:
					this.dispatchEvent(new CustomEvent("pause"));
					break;
			}

			this.dispatchEvent(new CustomEvent("statechange", {
				detail: { state: state }
			}));
		}

		if(state == Player.State.PLAYING) {
			this.loaded = true;
		}
	}
}

customElements.define("w2-player", Player);