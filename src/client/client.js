import '../../components/Preference.js';
import '../../components/Itemlist.js';
import '../../components/VideoList.js';

import { Room } from './Room.js';
import { Notification } from './Notifications.js';
import { Service } from './Service.js';
import '@uncut/gyro/components/menu-bar/Menubar.js';
import '@uncut/gyro/components/Icon.js';
import '@uncut/gyro/components/settings/Settings.js';
import '@uncut/gyro/components/Input.js';
import { Action } from '@uncut/gyro/src/core/Actions.js';

window.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onLoad);

Action.register({
	name: 'paste.video',
	description: 'Paste video into room.',
	shortcut: 'Ctrl+V',
	onAction() {
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
	}
});

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
}
