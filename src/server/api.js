const express = require('express');

function jsonResponse(data) {
	if(data) {
		return {
			error: false,
			response: data
		};
	} else {
		return {
			error: "Not found",
			response: {}
		};
	}
}

module.exports = {
	watchApi(roomStore) {
		const router = express.Router();

		router.get('/', (req, res) => res.send(jsonResponse()));
		
		router.get('/rooms', (req, res) => {
			const result = [];
			let maxResult = 10;
			let results = 0;
			for(let row of roomStore) {
				results++;
				const room = row[1];
				result.push({
					id: room.id,
					queue: room.queue,
					state: room.state,
					currentHost: room.hostId,
					userCount: room.userlist.size,
				})
				if(results >= maxResult) {
					break;
				}
			}
			res.send(jsonResponse(result));
		});

		return router;
	}
};
