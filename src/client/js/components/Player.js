export default class Player extends HTMLElement {

	static get State() { return {
		EMPTY: 0,
		PLAYING: 1,
		PAUSED: 2,
		SEEKING: 3,
	}}

	play() {

	}

	pause() {

	}

	get currentTime() {

	}

	set currentTime(v) {

	}

	loadVideo() {

	}

	get activePlayer() {
		return null;
	}

	static get template() {
		return `
			<div class="active player" id="ytplayer"></div>
			<div class="player" id="twitchplayer"></div>
		`;
	}

	connectedCallback() {
		this.innerHTML = this.constructor.template;
	}

	constructor() {
		super();

		this.player = null;
		this.state = 0;
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
		this.state = state;
		this.dispatchEvent(new Event("statechange"));
	}
}

customElements.define("w2-player", Player);