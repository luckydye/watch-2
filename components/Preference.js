import { Preferences } from "../src/client/Preferences.js";

function randomUsername() {
	return "User" + Math.floor(Math.random() * 1000);
}

class Preference extends HTMLElement {

	static get observedAttributes() {
		return ['placeholder', 'key', 'type', 'checked'];
	}

	constructor() {
		super();

		this.key = null;

		this.input = document.createElement("input");
		this.input.onblur = () => this.onChange(this.input.value);
		this.input.onchange = () => this.onChange(this.input.value);

		Preferences.subscribe((key, value) => {
			if (this.key == key) {
				if (this.type == "checkbox") {
					this.input.checked = value;
				}
				if (value && value.length > 2) {
					this.input.value = value;
				}
			}
		})
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}

	set placeholder(val) { this.input.placeholder = val; }
	get placeholder() { return this.input.placeholder; }

	set type(val) { this.input.type = val; }
	get type() { return this.input.type; }

	set checked(val) { this.input.checked = val; }
	get checked() { return this.input.checked; }

	onChange(value) {
		if (this.type == "checkbox") {
			Preferences.set(this.key, this.input.checked);
		}
		if (value && value.length > 2) {
			Preferences.set(this.key, value);
		}
	}

	connectedCallback() {
		this.innerHTML = "";
		this.appendChild(this.input);

		let value = Preferences.get(this.key);
		if (!value && this.key == "username") {
			// gen random username
			value = Preferences.set(this.key, randomUsername());
		}
		if (value) {
			this.input.value = value;
		}
	}
}

class PreferenceSwitch extends Preference {
	constructor() {
		super();
		this.type = "checkbox";
		this.input.checked = false;
		this.input.onblur = () => { };
		this.input.onchange = () => this.onChange(this.input.checked);
	}

	connectedCallback() {
		super.connectedCallback();
		const handle = document.createElement("span");
		handle.className = "handle";
		this.appendChild(handle);

		this.onChange();
	}
}

customElements.define("w2-preference", Preference);
customElements.define("w2-preference-switch", PreferenceSwitch);