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
