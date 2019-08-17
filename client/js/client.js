import './components/Player.js';
import './components/Preference.js';
import './components/Userlist.js';
import './components/VideoList.js';

import { Room } from './modules/Room.js';
import { Notification } from './modules/Notifications.js';

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
		if (navigator.clipboard.readText) {
			navigator.clipboard.readText().then(clipText => {
				room.addVideo(clipText);
			});
		} else {
			new Notification({
				type: Notification.TEXT,
				text: "Use Ctrl+V for adding Videos.",
				time: 5000
			}).display(document.querySelector("w2-notifications"));

			new Notification({
				type: Notification.TEXT,
				text: "This browser does not support reading the Clipboard. \nUse Chrome for the best experience!",
				time: 6500
			}).display(document.querySelector("w2-notifications"));
		}
	})

	// support for stupid bvrowsers
	window.addEventListener('paste', e => {
		const pasteData = e.clipboardData.getData('text');
		room.addVideo(pasteData);
	});

}

window.parseVideoUrl = (url) => {
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
