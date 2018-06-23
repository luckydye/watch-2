
import constants from './constants';

function service(path) {
	const api = `${location.origin}${constants.API_PATH}`;
	const res = await fetch(api + path);
	return res.json();
}

export default class Player {

	constructor() {
		
	}

}