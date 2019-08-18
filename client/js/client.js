import './components/Player.js';
import './components/Preference.js';
import './components/Itemlist.js';
import './components/VideoList.js';

import { Room } from './modules/Room.js';
import { Notification } from './modules/Notifications.js';
import { Service } from './modules/Service.js';
import { YouTube } from './services/ServiceYouTube.js';
import { Twitch } from './services/ServiceTwitch.js';
import { IFrames } from './services/ServiceIframe.js';

window.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onLoad);

let room;

function onYouTubeIframeAPIReady() {
	onLoad();
}

function onLoad() {
	Service.registerService(YouTube);
	Service.registerService(Twitch);
	Service.registerService(IFrames);

	room = new Room();
}

function onDomReady() {
	// UI stuff
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
