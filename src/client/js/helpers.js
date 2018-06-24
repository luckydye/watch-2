
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