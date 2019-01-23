const Plugin = require('../rooms/Plugin.js');
const discord = require('discord.js');
const { randomRoomId } = require('../helper.js');

const client = new discord.Client();

class Discord extends Plugin {

	constructor(args) {
		super(args);

		const Room = this.Room;
		const io = this.socket;

		client.on('ready', () => {
			Discord.log(`Logged in as ${client.user.tag}`);
		});
	
		client.on('message', msg => {
			const test = this.scanMessage(msg.content);
			if(test) {
				const targetRoom = Room.resolve(io, '/' + test.room);
				targetRoom.addToQueue(test.link.service, test.link.id);
				msg.reply('Video added to ' + global.config.discordBotLinkResponse + test.room);
			}
		});
	
		client.login(global.config.discordBotToken);
	}

	scanMessage(msgString) {
		const content = { room: null, link: null };
		const split = msgString.split(" ");
		const parseUrl = this.parseLink(split[0]);
		if(parseUrl) {
			content.room = split[1] || randomRoomId();
			content.link = parseUrl;
		}
		return content.room && content.link ? content : null;
	}

	parseLink(url) {
		const youtubeId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
		const twithcId = url.match(/(?:twitch.tv\/videos\/)([^\s&]+)/);

		if(youtubeId != null) {
			return {
				id: youtubeId[1],
				service: "youtube.com",
				link: url,
			};
		} else if(twithcId != null) {
			return {
				id: twithcId[1],
				service: "twitch.tv",
				link: url,
			};
		}
		return null;
	}

}

module.exports = Discord;
