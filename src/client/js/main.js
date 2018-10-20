import { Socket } from './Socket.js';

window.addEventListener("DOMContentLoaded", () => {

	let socket;

	const player = document.querySelector("w2-player");
	player.onReady = () => {
		// Init socket
		socket = new Socket();
	}

	// Userlist toggle button
	document.querySelector(".toggle-userlist").onclick = () => bindButton("userlist-open");

	// video add button
	document.querySelector(".video-queue .addVideo").addEventListener("click", () => {
		const link = prompt("YouTube Video Link");
		const parsed = parseYoutubeUrl(link);
		if(parsed) {
			socket.addVideoToQueue(parsed.id);
		} else {
			displayNotification("Inavlid URL", 2000);
		}
	})

	document.querySelector(".video-queue w2-queue").removeVideo = (index, id) => {
		socket.removeVideoFromQueue({ index, id });
	}

	document.querySelector(".video-queue w2-queue").playVideo = (index, id) => {
		socket.playVideo({ index, id });
	}
})