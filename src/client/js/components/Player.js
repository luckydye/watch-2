export default class Player extends HTMLElement {

	connectedCallback() {
		// insert api lib
		const script = document.createElement("script");
		script.onload = () => {
			window.onYouTubeIframeAPIReady = () => this.setupPlayer();
		}
		script.src = "https://www.youtube.com/iframe_api";
		this.appendChild(script);
	}

	setupPlayer() {
		const player = this;
		this.player = new YT.Player('ytplayer', {
			height: '100%',
			width: '100%',
			events: {
				'onStateChange': state => {
					player.onStateChange(state);
				},
				'onReady': player.onReady.bind(player),
			}
		})
	}

	onReady() {
		console.log("player ready");
	}

	onStateChange(state) {
		// State hook
	}
}

customElements.define("w2-player", Player);