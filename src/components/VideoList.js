import { Service } from '../Service.js';

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

		for (let i = 0; i < this.list.length; i++) {
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

		const service = Service.getService(this.service);

		service.getThumbnailURL(this.vidid).then(url => {
			thumbnail.src = url;
		})

		if (this.parentNode.hasAttribute('show-statistics')) {
			service.getVideoMetaData(this.vidid).then(stats => {
				this.statistics = stats;

				const statsEle = document.createElement('div');
				statsEle.className = "statistics";

				const opts = {
					style: "decimal",
					minimumIntegerDigits: 3,
					minimumSignificantDigits: 3,
				};

				const rating = new Intl.NumberFormat('en-EN', opts).format(this.statistics.likeCount - this.statistics.dislikeCount);
				const views = new Intl.NumberFormat('en-EN', opts).format(this.statistics.viewCount);

				statsEle.innerHTML = `
					<a><i class="material-icons" style="font-size: 12px;">thumb_up_alt</i> ${rating}</a>
					<a><i class="material-icons" style="font-size: 12px;">remove_red_eye</i> ${views}</a>
				`;

				this.appendChild(statsEle);
			})
		}

		this.append(thumbnail);
	}

	onOpen() {
		const a = document.createElement("a");

		const service = Service.getService(this.service);
		const videoURL = service.getVideoURL(this.vidid);

		a.href = videoURL;
		a.target = "blank";
		a.click();
	}

}

customElements.define("w2-videolist", VideoList);
customElements.define("w2-videolist-item", VideoListItem);