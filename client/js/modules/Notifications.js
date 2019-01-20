window.emoteStore = window.emoteStore || new Map();
const emoteStore = window.emoteStore;

function cacheEmotes(url) {
	return fetch(url).then(res => res.json().then(json => {
		return json;
	}));
}

function getEmote(name) {
	if(emoteStore.has(name)) {
		const domEle = document.createElement('img');
		domEle.src = emoteStore.get(name);
		domEle.height = 40;
		return domEle;
	} else {
		return null;
	}
}

export class Notification {

	static loadEmotes(url) {
		cacheEmotes(url).then(json => {
			const emotes = json.sets[Object.keys(json.sets)[0]].emoticons;
			for(let emote of emotes) {
				emoteStore.set(emote.name, emote.urls['2']);
			}
		})
	}

	static get TEXT() { return 0; }
	static get EMOTE() { return 1; }

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

		if(container) {
			const note = document.createElement("w2-notification");

			switch(this.type) {
				
				case Notification.TEXT:
					note.innerText = text;
					break;

				case Notification.EMOTE:
					const emote = getEmote(this.text);
					if(emote) {
						note.classList.add('emote');
						note.appendChild(emote);
					} else {
						return;
					}
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
