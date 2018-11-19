function bindButton(attr) {
	const state = document.body.getAttribute(attr) == "true" ? false : true;
	document.body.setAttribute(attr, state);
}

function parseVideoUrl(url) {
	const youtubeId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
	const twithcId = url.match(/(?:twitch.tv\/videos\/)([^\s&]+)/);

	if(youtubeId != null) {
		return {
			id: youtubeId[1],
			service: "youtube.com",
		};
	} else if(twithcId != null) {
		return {
			id: twithcId[1],
			service: "twitch.tv",
		};
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

class Preferences {

	static getAll() {
		let preferences = localStorage.getItem("preferences");
		if(!preferences) {
			preferences = {};
		} else {
			preferences = JSON.parse(preferences);
		}
		return preferences;
	}

	static get(key) {
		return Preferences.getAll()[key];
	}
	
	static set(key, val) {
		let preferences = Preferences.getAll();
		preferences[key] = val;
		localStorage.setItem("preferences", JSON.stringify(preferences));
		return preferences[key];
	}
	
}
