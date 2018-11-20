const fetch = require('node-fetch');

module.exports = {

	'OfflineTV': {
		onCreate(room) {
			this.room = room;
			this.timeout = 10 * 60 * 1000;
			this.open = true;
		},
		onNewVideo(video) {
			if(this.open && this.room.userlist.size < 2) {
				this.notifyDiscord(video);
			}
		},
		notifyDiscord(video) {
			if(video.service !== "youtube.com") {
				return;
			}

			this.open = false;
			setTimeout(() => { this.open = true; }, this.timeout);

			const roomUrl = "https://watch.luckydye.de/r/" + this.room.id;

			const message = {
				username: "Watch 2 | " + this.room.id,
				embeds: [
					{
						title: "New Video in /r/OfflineTV",
						image: {
							url: `https://i1.ytimg.com/vi/${video.id}/hqdefault.jpg`,
						},
						url: roomUrl,
					}
				]
			}

			const webhook = "https://discordapp.com/api/webhooks/514082688404160522/xfbiQbUhD5Dlvnbb6ewzotPgtcBjFvprskpDIOghrECceHm3teaYK-NYCZnRZqf6W4OK";
			return fetch(webhook, {
				method: 'POST',
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify(message)
			}).then(res => res.json().then(j => {
				console.log(j);
			}))
		}
	}

}