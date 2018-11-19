import { Room } from './Room.js';

let room = null;

window.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onLoad);

function onYouTubeIframeAPIReady() {
	onLoad();
}

function onLoad() {
	room = new Room();
}

function onDomReady() {
	// UI stuff

	document.querySelector(".room-title").innerText = location.pathname.split("/").reverse()[0];

	// Userlist toggle button
	document.querySelector(".toggle-userlist").onclick = () => bindButton("userlist-open");
	// Video Queue toggle button
	document.querySelector(".toggle-video-queue").onclick = () => bindButton("video-queue-open");

	// video add button
	const input = document.querySelector(".addToQueueDialog input");
	document.querySelector(".video-queue .addVideo").addEventListener("click", () => {
		document.body.setAttribute("queue-add-dialog", "true");
		input.focus();
	})
	input.onblur = () => {
		setTimeout(() => {
			document.body.setAttribute("queue-add-dialog", "false");
		}, 150);
	}
}
