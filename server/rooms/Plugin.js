module.exports = class Plugin {

	get rooms() {
		return null;
	}

	onCreate(room) {
		this.room = room;
	}

	onJoined(username) {
		
	}

	onLeft(username) {

	}

	onPlayVideo(video) {
		
	}

	onPauseVideo(video) {
		
	}

	onSkipToVideo(video) {
		
	}

	onNewVideo(video) {
		
	}
	
}
