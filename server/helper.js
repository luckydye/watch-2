function randomRoomId() {
	return Math.floor(Math.random() * 1000000).toString();
}

function parseVideoUrl(url) {
	const youtubeId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
	const twithcId = url.match(/(?:twitch.tv\/videos\/)([^\s&]+)/);

	if (youtubeId != null) {
		return {
			id: youtubeId[1],
			service: "youtube.com",
			link: url,
		};
	} else if (twithcId != null) {
		return {
			id: twithcId[1],
			service: "twitch.tv",
			link: url,
		};
	}
	return null;
}

module.exports = {
	randomRoomId,
	parseVideoUrl
}
