export default class Queue extends HTMLElement {

	constructor() {
		super();
		this.queue = [];
	}

	connectedCallback() {
		this.innerHTML = "";
		this.render();
	}

	addVideo(vidId) {
		this.queue.push(vidId);
		this.render();
	}

	render() {
		this.innerHTML = "";
		for(let i = 0; i < this.queue.length; i++) {
			const id = this.queue[i];
			const item = document.createElement("w2-queueitem");
			item.vidid = id;
			item.onPlay = () => {
				this.playVideo(i, id);
			}
			item.onDelete = () => {
				this.removeVideo(i, id);
			}
			this.appendChild(item);
		}
	}

	removeVideo(index, id) { /* hook */ }

	playVideo(index, id) { /* hook */ }
}

class QueueItem extends HTMLElement {

	set vidid(val) {
		this.setAttribute("vidid", val);
	}

	get vidid() {
		return this.getAttribute("vidid");
	}

	connectedCallback() {
		this.innerHTML = "";
		
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

		const openbtn = document.createElement("button");
		openbtn.innerHTML = "open_in_new";
		openbtn.title = "Open video on YouTube";
		openbtn.className = "openbtn material-icons";
		openbtn.onclick = this.onOpen.bind(this);

		overlay.appendChild(openbtn);
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

	onOpen() {
		const a = document.createElement("a");
		a.href = "https://www.youtube.com/watch?v=" + this.vidid;
		a.target = "blank";
		a.click();
	}

}

customElements.define("w2-queue", Queue);
customElements.define("w2-queueitem", QueueItem);