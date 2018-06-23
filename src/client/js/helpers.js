
function createNotification(text, time) {
	const notes = document.querySelector("w2-notifications");
	const note = document.createElement("w2-notification");
	note.innerHTML = text;
	note.timer = time;
	setTimeout(() => {
		note.style.setProperty("animation", "fade-out .3s ease");
		setTimeout(() => { note.remove(); }, 300);
	}, note.timer);
	notes.appendChild(note);
}