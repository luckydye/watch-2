import { Service } from '../js/Service.js';
import { PlayerInterface } from '../js/PlayerInterface.js';

export default class Player extends HTMLElement {

	static get template() {
		return `
			<div class="player" id="ytplayer"></div>
			<div class="player" id="twitchplayer"></div>
			<div class="player" id="flowplayer"></div>
			<div class="player" id="iframe"></div>

			<div class="player" id="placeholder">
				<h3>
					1. Copy Video URL
				</h3>
				<h3>
					2. Press the "Paste" button on the top left or press Ctrl+V, to insert the video.
				</h3>

				<p>
					<a style="color: grey; font-size: 14px;">
						Only YouTube and Twitch VODs (not clips) can be played back synchronously
					</a>
				</p>
			</div>
		`;
	}

	get player() {
		if (this.video.service) {
			return this.players[this.video.service];
		}
	}

	get currentVideoId() {
		return this.video.id;
	}

	constructor() {
		super();

		this.loaded = false;
		this.state = 0;

		this.players = {};

		this.video = {
			id: null,
		}
	}

	registerPlayerInterface(interfaceInstance) {
		this.players[interfaceInstance.service] = interfaceInstance;

		interfaceInstance.onStateChange = state => {
			this.onStateChange(state);
		}

		interfaceInstance.onReady = () => {
			this.onReady();
		};
	}

	connectedCallback() {
		this.innerHTML = this.constructor.template;
	}

	loadVideo({ service, id, startSeconds }, state) {
		if (this.loaded) {
			this.pause();
		}

		this.loaded = false;

		const playerInterface = this.players[service];
		playerInterface.loadVideo({ service, id, startSeconds }, state);

		const currentPlayer = this.players[this.video.service];
		if (currentPlayer) {
			document.querySelector('#' + currentPlayer.containerId).removeAttribute('style');
		}
		document.querySelector('#' + playerInterface.containerId).style.zIndex = 1000;

		this.video.id = id;
		this.video.service = service;

		if (state == PlayerInterface.PAUSED) {
			this.pause(true);
		} else if (state == PlayerInterface.PLAYING) {
			this.play(true);
		}
	}

	play(force) {
		if (this.state !== PlayerInterface.PLAYING || force) {
			this.player.play();
		}
	}

	pause(force) {
		if (this.state !== PlayerInterface.PAUSED || force) {
			this.player.pause();
		}
	}

	seekTo(t) {
		this.player.seekTo(t);
	}

	getCurrentTime() {
		return this.player.getCurrentTime();
	}

	getDuration() {
		return this.player.getDuration();
	}

	setupPlayer() {

		let lastPlayerTime = 0;

		const tick = () => {
			requestAnimationFrame(tick);

			if (!this.player) return;

			const currentTime = this.getCurrentTime();
			if (this.loaded) {
				if (lastPlayerTime > 1) {
					const diff = currentTime - lastPlayerTime;
					if (Math.abs(diff) > 1) {
						this.dispatchEvent(new CustomEvent("seek", {
							detail: { time: currentTime }
						}));
					}
				}
				lastPlayerTime = currentTime;
			}
		}
		tick();
	}

	onReady() {
		this.dispatchEvent(new CustomEvent("ready"));
	}

	onStateChange(state) {
		this.state = state;

		if (this.loaded) {
			switch (state) {
				case PlayerInterface.PLAYING:
					this.dispatchEvent(new CustomEvent("play"));
					break;
				case PlayerInterface.PAUSED:
					this.dispatchEvent(new CustomEvent("pause"));
					break;
			}

			this.dispatchEvent(new CustomEvent("statechange", {
				detail: { state: state }
			}));
		}

		if (state == PlayerInterface.PLAYING) {
			this.loaded = true;
		}
	}
}

customElements.define("w2-player", Player);