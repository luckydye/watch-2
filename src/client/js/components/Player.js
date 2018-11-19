export default class Player extends HTMLElement {

	static get State() { return {
		EMPTY: 0,
		PLAYING: 1,
		PAUSED: 2,
		SEEKING: 3,
	}}

	play() {
		this.player.playVideo();
	}

	pause() {
		this.player.pauseVideo();
	}

	loadVideo({service, id, startSeconds}) {
		this.service = service;
		if(service == "youtube.com") {
			this.player.loadVideoById({
				videoId: id,
				startSeconds: startSeconds,
			});
		} else if(service == "twitch.tv") {
			console.log(service);
		}
		
		this.initState = null;
	}

	seekTo(t) {
		this.player.seekTo(t);
	}

	get activePlayer() {
		return null;
	}

	getCurrentTime() {
		return this.player.getCurrentTime();
	}

	get state() {
		return this.player.getPlayerState();
	}

	get currentVideoId() {
		return this.player.getVideoData().video_id;
	}

	static get template() {
		return `
			<div class="active player" id="ytplayer"></div>
			<div class="player" id="twitchplayer"></div>
		`;
	}

	constructor() {
		super();
		
		this.service = "";
		this.initState = null;
		this.player = null;
	}

	connectedCallback() {
		this.innerHTML = this.constructor.template;
	}

	setupPlayer() {
		this.player = new YT.Player('ytplayer', {
			events: {
				'onStateChange': state => {
					this.onStateChange(state.data);
				},
				'onReady': () => {
					this.onReady();
				}
			}
		})

		const twitchplayer = new Twitch.Player("twitchplayer", {
			
		});
	}

	onReady() {
		this.dispatchEvent(new Event("ready"));
	}

	onStateChange(state) {
		this.dispatchEvent(new Event("statechange"));
	}
}

customElements.define("w2-player", Player);