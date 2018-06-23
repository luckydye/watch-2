import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

class HoverButton extends PolymerElement {

    static get properties() {
		return {
			background: String,
			link: String,
			value: String
		}
	}

	static get template() {
		return html`
			<style>
				:host {
					background: rebeccapurple;
					display: inline-block;
					border-radius: 10px;
					box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
					cursor: pointer;
					user-select: none;
					position: relative;
					transition: .15s ease;

					text-transform: uppercase;
					letter-spacing: 1px;
					font-family: sans-serif;
					color: #d8d8d8;
				}
				:host(:hover) {
					color: #fff;
				}
				a {
					display: block;
					padding: 10px 18px;
					z-index: 100;
				}

				/* Hover effect styleing */
				:host {
					overflow: hidden;
					--xy: 0 0;
				}
				:host:after {
					content: "";
					display: block;
					opacity: 0;
					position: absolute;
					left: 0;
					top: 0;
					height: 100%;
					width: 100%;
					z-index: 1;
					transition: all .8s ease;
					
					background-image: radial-gradient(rgba(255, 255, 255, 0.25), transparent 75%);
					background-position: var(--xy);
					background-repeat: no-repeat;
					background-size: 200% 200%;
				}
				:host(:hover):after {
					transition: all 0.1s ease;
					opacity: 1;
				}
				:host(:active):after {
					transform: scale(2);
				}
			</style>
			<a href="[[link]]">[[value]]</a>
		`;
	}
	
	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("mousemove", e => {
			const rect = this.getBoundingClientRect();
			const x = e.clientX - rect.left - this.offsetWidth;
			const y = e.clientY - rect.top - this.offsetHeight;
			this.style.setProperty("--xy", `${x}px ${y}px`);
		});
	}

}

customElements.define("hover-button", HoverButton);