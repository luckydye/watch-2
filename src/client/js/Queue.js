export default class Queue extends HTMLElement {

	constructor() {
		super();
		this.queue = [];
	}

	connectedCallback() {
		this.innerHTML = "";
		this.render();

		this.addVideo("UFfYzyWkSCA");

		setTimeout(() => {
			this.addVideo("01OtZZs4Pus");
		}, 200);
	}

	addVideo(vidId) {
		const item = document.createElement("w2-queueitem");
		item.vidid = vidId;
		item.onPlay = () => {
			this.playVideo(this.queue.indexOf(item));
		}
		item.onDelete = () => {
			this.removeVideo(this.queue.indexOf(item));
		}

		this.queue.push(item);
		this.render();
		return item;
	}

	removeVideo(index) {
		const item = this.queue.splice(index, 1);
		this.render();
		return item;
	}

	playVideo(index) {
		if(index > 0) {
			const item = this.queue.splice(index, 1)[0];
			this.queue.unshift(item);
			this.render();
			return item;
		}
	}

	render() {
		this.innerHTML = "";
		for(let item of this.queue) {
			this.appendChild(item);
		}
	}
}

class QueueItem extends HTMLElement {

	set vidid(val) {
		this.setAttribute("vidid", val);
	}

	get vidid() {
		return this.getAttribute("vidid");
	}

	connectedCallback() {
		const overlay = document.createElement("div");
		overlay.className = "controls";
		
		const pbtn = document.createElement("button");
		pbtn.innerHTML = "play_arrow";
		pbtn.title = "Play this video";
		pbtn.className = "playbtn material-icons";
		pbtn.onclick = this.onPlay.bind(this);

		const dbtn = document.createElement("button");
		dbtn.innerHTML = "remove_circle";
		dbtn.title = "Remove this video";
		dbtn.className = "delbtn material-icons";
		dbtn.onclick = this.onDelete.bind(this);

		overlay.appendChild(pbtn);
		overlay.appendChild(dbtn);

		this.appendChild(overlay);

		const thumbnail = new Image();
		thumbnail.src = `https://i1.ytimg.com/vi/${this.vidid}/hqdefault.jpg`;
		this.append(thumbnail);
	}

	onPlay() {
		console.log("play", this.vidid);
	}

	onDelete() {
		console.log("delete", this.vidid);
	}

}

customElements.define("w2-queue", Queue);
customElements.define("w2-queueitem", QueueItem);