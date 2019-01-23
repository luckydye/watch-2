module.exports = class Plugin {

	static log(...args) {
		console.log('['+this.name+'] >', ...args);
	}

	get rooms() { return null; }

	constructor(args = {}) {
		for(let key in args) {
			this[key] = args[key];
		}
	}

	onCreate(room) {
		this.room = room;
	}

	onJoined(username) { }

	onLeft(username) { }

	onPlayVideo(video) { }

	onPauseVideo(video) { }

	onSkipToVideo(video) { }

	onNewVideo(video) { }
}
