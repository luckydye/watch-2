import { Socket } from './Socket.js';

window.addEventListener("DOMContentLoaded", () => {

	// Init socket
	const socket = new Socket();

	// Userlist toggle button
	document.querySelector(".toggle-userlist").onclick = () => bindButton("userlist-open");

	// testing noteifications
	displayNotification("Connected", 2000, note => {
		console.log("Clicked on notification!");
	});

	// video add button
	document.querySelector(".video-queue .addVideo").addEventListener("click", () => {
		const link = prompt("YouTube Video Link");
		const parsed = parseYoutubeUrl(link);

		if(parsed) {
			const queue = document.querySelector("w2-queue");
			queue.addVideo(parsed.id);
		} else {
			displayNotification("Inavlid URL", 2000);
		}
	})
})