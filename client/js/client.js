import './components/Player.js';
import './components/Preference.js';
import './components/Userlist.js';
import './components/VideoList.js';
import './components/Statistics.js';

import { Room } from './modules/Room.js';
import { Notification } from './modules/Notifications.js';

Notification.loadEmotes("https://api.frankerfacez.com/v1/room/luckydye");

window.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onLoad);

let room;

function onYouTubeIframeAPIReady() {
	onLoad();
}

function onLoad() {
	room = new Room();
}

function onDomReady() {
	// UI stuff
	document.querySelector(".room-title").innerText = location.pathname.split("/").reverse()[0];

	function bindButton(attr) {
		const state = document.body.getAttribute(attr) == "true" ? false : true;
		document.body.setAttribute(attr, state);
	}

	// Video Queue toggle button
	document.querySelector(".toggle-video-queue").onclick = () => bindButton("video-queue-open");

	// video add button
	document.querySelector(".video-queue .addVideo").addEventListener("click", e => {
		navigator.clipboard.readText().then(clipText => {
			room.addVideo(clipText);
		});
	})

}

window.parseVideoUrl = (url) => {
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
