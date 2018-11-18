import { Socket } from './Socket.js';

window.addEventListener("DOMContentLoaded", () => {

	// Set room name
	document.querySelector(".room-title").innerText = location.pathname.split("/").reverse()[0];

	let socket;

	const player = document.querySelector("w2-player");
	player.onReady = () => {
		// Init socket
		socket = new Socket();
	}

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

	document.querySelector(".addToQueueDialog button").addEventListener("click", () => {
		const link = input.value;
		if(!link) return;

		const parsed = parseYoutubeUrl(link);
		if(parsed) {
			socket.addVideoToQueue(parsed.id);
		} else {
			displayNotification("Inavlid URL", 2000);
		}
		document.body.setAttribute("queue-add-dialog", "false");
		input.value = "";
	})

	document.querySelector(".video-queue w2-videolist#queue").removeVideo = (index, id) => {
		socket.removeVideoFromQueue({ index, id });
	}

	document.querySelector(".video-queue w2-videolist").playVideo = (index, id) => {
		socket.playVideo({ index, id });
	}

	document.querySelector(".history w2-videolist").playVideo = (index, id) => {
		const q = socket.addVideoToQueue(id);
		socket.playVideo({ index: q.length, id });
	}

	// Room state

	document.querySelector("w2-preference-switch#saveRoom").onChange = (value) => {
		socket.setRoomState({ saved: value });
	}
})