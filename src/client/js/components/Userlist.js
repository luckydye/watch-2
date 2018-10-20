class Itemlist extends HTMLElement {

	constructor() {
		super();

		this.list = [];
	}

	connectedCallback() {
		this.render();
	}

	display(arr) {
		this.list = arr;
		this.render();
	}

	render() {
		this.innerHTML = "";
		for(let item of this.list) {
			const ele = document.createElement("div");
			ele.className = "item";
			ele.innerText = item;
			this.appendChild(ele);
		}
	}
}

customElements.define("w2-itemlist", Itemlist);