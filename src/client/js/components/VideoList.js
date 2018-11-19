export class VideoList extends HTMLElement {

	get Item() {
		return VideoListItem;
	}

	constructor() {
		super();
		this.list = [];
	}

	connectedCallback() {
		this.innerHTML = "";
		this.render();
	}

	render() {
		this.innerHTML = "";
		for(let i = 0; i < this.list.length; i++) {
			const vid = this.list[i];
			const item = new this.Item({
				id: vid.id,
				service: vid.service,
			});
			item.onPlay = () => {
				this.playVideo(i, vid);
			}
			item.onDelete = () => {
				this.removeVideo(i, vid);
			}
			this.appendChild(item);
		}
	}

	removeVideo(index, vid) { /* hook */ }

	playVideo(index, vid) { /* hook */ }
}

export class VideoListItem extends HTMLElement {

	constructor({ id, service }) {
		super();

		this.vidid = id;
		this.service = service;
	}

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
		switch(this.service) {
			case "youtube.com":
				thumbnail.src = `https://i1.ytimg.com/vi/${this.vidid}/hqdefault.jpg`;
				break;
			case "twitch.tv":
				this.getTwitchThumbnail(this.vidid).then(url => {
					thumbnail.src = url;
				})
				break;
		}
		this.append(thumbnail);
	}

	getTwitchThumbnail(id) {
		const clientId = "mdn23u65h8g1mxrg0kr9yaw51vivmj";
		const url = `https://api.twitch.tv/kraken/videos/${id}?client_id=${clientId}`;
		return fetch(url).then(res => res.json().then(json => {
			return json.thumbnails[0].url;
		}));
	}

	onOpen() {
		const a = document.createElement("a");
		switch(this.service) {
			case "youtube.com":
				a.href = "https://www.youtube.com/watch?v=" + this.vidid;
				break;
			case "twitch.tv":
				a.href = "https://www.twitch.tv/videos/" + this.vidid;
				break;
		}
		a.target = "blank";
		a.click();
	}

}

customElements.define("w2-videolist", VideoList);
customElements.define("w2-videolist-item", VideoListItem);