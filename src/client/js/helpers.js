window.addEventListener("DOMContentLoaded", () => {

	// Userlist toggle button
	document.querySelector(".toggle-userlist").onclick = () => bindButton("userlist-open");

	// testing noteifications
	displayNotification("Connected", 10000, note => {
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

function bindButton(attr) {
	const state = document.body.getAttribute(attr) == "true" ? false : true;
	document.body.setAttribute(attr, state);
}

function parseYoutubeUrl(url) {
	const videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
	if(videoid != null) {
		return { id: videoid[1] };
	}
	return null;
}

function service(path) {
	const api = `${location.origin}${constants.API_PATH}`;
	return fetch(api + path).then(res => res.json());
}

// Notifications api
function displayNotification(text, time, onclick) {
	const notes = document.querySelector("w2-notifications");
	if(notes) {
		const note = document.createElement("w2-notification");
		note.innerHTML = text;
		note.timer = time;

		const timer = setTimeout(() => {
			close();
		}, note.timer);

		function close() {
			note.style.setProperty("animation", "fade-out .25s ease");
			setTimeout(() => { note.remove(); }, 200);
		}

		note.onclick = () => {
			clearTimeout(timer);
			if(onclick) {
				onclick(note);
			}
			close();
		}

		notes.appendChild(note);
	}
}
