export default class Preferences {

	static getAll() {
		let preferences = localStorage.getItem("preferences");
		if(!preferences) {
			preferences = {};
		} else {
			preferences = JSON.parse(preferences);
		}
		return preferences;
	}

	static get(key) {
		return Preferences.getAll()[key];
	}
	
	static set(key, val) {
		let preferences = Preferences.getAll();
		preferences[key] = val;
		localStorage.setItem("preferences", JSON.stringify(preferences));
		return preferences[key];
	}
	
}
