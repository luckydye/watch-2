import '../components/Preference.js';
import '../components/Itemlist.js';
import '../components/VideoList.js';

import { Room } from './Room.js';
import { Notification } from './Notifications.js';
import { Service } from './Service.js';

window.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onLoad);

let room;

function onLoad() {
	room = new Room();
}

function onDomReady() {
	// UI stuff
	function bindButton(attr) {
		const state = document.body.getAttribute(attr) == "true" ? false : true;
		document.body.setAttribute(attr, state);
	}

	// Video Queue toggle button
	document.querySelector(".toggle-history").onclick = () => bindButton("video-history-open");

	// video add button
	document.querySelector(".sidebar .add-video").addEventListener("click", e => {
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
