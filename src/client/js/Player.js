export default class Player extends HTMLElement {

	constructor() {
		super();
		console.log("Player init ...");
	}

	connectedCallback() {
		// insert api lib
		const script = document.createElement("script");
		script.onload = () => {
			window.onYouTubeIframeAPIReady = () => this.setupPlayer();
		}
		script.src = "https://www.youtube.com/iframe_api";
		this.appendChild(script);
	}

	onStateChange(state) {
		console.log(state.data);
	}

	onReady() {
		console.log("YT Player ready ...");
		// Testing
		this.play("hypoh_d5zOA");
	}

	setupPlayer() {
		const player = this;
		this.player = new YT.Player('ytplayer', {
			height: '100%',
			width: '100%',
			events: {
				'onStateChange': player.onStateChange.bind(player),
				'onReady': player.onReady.bind(player),
			}
		})
	}

	play(id) {
		this.player.cueVideoById(id);
	}

	pause() {
		this.player.pauseVideo();
	}

	stop() {
		this.player.stopVideo();
	}

	currentVideo() {
		this.player.getVideoData();
	}

	seekTo(sec) {
		this.player.seekTo(sec);
	}

	loaded() {
		return this.player.getVideoLoadedFraction();
	}
}

customElements.define("w2-player", Player);