import Preferences from '../Preferences.js';

class Preference extends HTMLElement {

	static get observedAttributes() {
		return ['placeholder', 'key', 'type'];
	}

	constructor() {
		super();

		this.key = null;
		
		this.input = document.createElement("input");
		this.input.onblur = () => this.onChange(this.input.value);
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}

	set placeholder(val) { this.input.placeholder = val; }
	get placeholder() { return this.input.placeholder; }

	set type(val) { this.input.type = val; }
	get type() { return this.input.type; }

	onChange(value) {
		if(value.length > 2) {
			Preferences.set(this.key, value);
		}
	}

	connectedCallback() {
		this.innerHTML = "";
		this.appendChild(this.input);

		let value = Preferences.get(this.key);
		if(!value && this.key == "username") {
			// gen random username
			value = Preferences.set(this.key, randomUsername());
		}
		this.input.value = value;
	}
}

function randomUsername() {
	return "User" + Math.floor(Math.random() * 1000);
}

customElements.define("w2-preference", Preference);