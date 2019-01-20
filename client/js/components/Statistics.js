import { Room } from "../modules/Room.js";

function getStatistics() {
	const url = `${location.origin}/api/v1/stats/${Room.id}`;
	return fetch(url).then(res => res.json().then(json => json.response.stats));
}

export class Statistics extends HTMLElement {

	static temaplte(data) {
		return `
			<p>
				<span>Videos played: </span><span>${data.videosPlayed}</span>
			</p>
		`;
	}

	connectedCallback() {
		getStatistics().then(data => {
			const template = Statistics.temaplte(data);
			this.innerHTML = template;
		})
	}

}

customElements.define('w2-statistics', Statistics);
