import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import './hover-button';

class DropdownButton extends PolymerElement {

    static get properties() {
		return {
			value: String,
			options: Array,
			confirm: Function
		}
	}

	static get template() {
		return html`
			<style>
				:host {
					display: inline-block;
					position: relative;
					z-index: 1000;
					font-family: sans-serif;
					color: white;
					min-width: 150px;
				}

				hover-button {
					width: 100%;
					text-align: center;
				}

				.dropdown {
					position: absolute;
					top: 50%;
					left: 0;
					background: rebeccapurple;
					background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
					z-index: -1;
					transition: all .2s ease;
					overflow: hidden;
					box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.2);
					outline: none;
					border-radius: 10px;

					box-sizing: border-box;
					padding: 20px 0 5px 0;
					width: 100%;
					transform: scaleY(0);
					transform-origin: 50% 0;
				}

				.dropdown:focus {
					transform: scaleY(1);
				}

				.option {
					padding: 8px 10px;
					cursor: pointer;
					user-select: none;
				}
				.option:hover {
					background: rgba(255, 255, 255, 0.2);
				}
				.option:active {
					background: rgba(255, 255, 255, 0.1);
				}
			</style>
			
			<hover-button
				value="[[value]]"
			></hover-button>

			<div class="dropdown" tabindex="0"></div>
		`;
	}

	constructor() {
		super();
		this.items = {};
		this.confirm = () => {};
	}

	set options(options) {
		options(this.value).then(d => {
			this.items = d;
		})
	}

	open() {
		const dropdown = this.shadowRoot.querySelector(".dropdown");
		dropdown.innerHTML = "";
		dropdown.tabIndex = 0;
		Object.keys(this.items).forEach(optn => {
			const ele = document.createElement("div");
			ele.className = "option";
			ele.innerHTML = this.items[optn].name;
			ele.onclick = () => {
				this.confirm(this.value, this.items[optn].name);
			}
			dropdown.appendChild(ele);
		});
		dropdown.focus();
	}

	connectedCallback() {
		super.connectedCallback();
		
		this.onclick = () => {
			this.open();
		}
	}
}

customElements.define("dropdown-button", DropdownButton);