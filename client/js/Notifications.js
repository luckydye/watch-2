export class Notification {

	static get TEXT() { return 0; }

	constructor({
		text = "",
		time = 2000,
		type = Notification.TEXT
	} = {}) {
		this.text = text;
		this.time = time;
		this.type = type;
	}

	display(container) {
		const text = this.text;
		const time = this.time;

		if (container) {
			const note = document.createElement("w2-notification");

			switch (this.type) {

				case Notification.TEXT:
					note.innerText = text;
					break;
			}

			function close() {
				note.style.setProperty("animation", "fade-out .25s ease");
				setTimeout(() => { note.remove(); }, 200);
			}

			const timer = setTimeout(() => close(), time);

			note.onclick = () => {
				clearTimeout(timer);
				onclick && onclick(note);
				close();
			}

			container.appendChild(note);

			return note;
		}
	}

}
