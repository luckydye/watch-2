import { Socket } from './Socket.js';

function onDomReady() {

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

function onLoad() {
	const player = document.querySelector("w2-player");
	player.setupPlayer();

	let socket;

	player.addEventListener("ready", () => {
		socket = new Socket();
	})

	const input = document.querySelector(".addToQueueDialog input");

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
}

window.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onLoad);

function onYouTubeIframeAPIReady() {
	onLoad();
}
