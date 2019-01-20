const Plugin = require('../rooms/Plugin.js');
const reactionEvents = require('../../resources/reactionEvents.json');

class Reactions extends Plugin {
	
	get rooms() {
		return [ 'OfflineTV' ];
	}

	onNewVideo(username) {
		this.sendReactionMessage('OMEGALUL');
	}
	
	sendReactionMessage(emote) {
		this.room.broadcast('message', {
			message: emote,
			reaction: true,
		});
	}

}

module.exports = Reactions;
