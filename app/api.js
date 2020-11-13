const express = require('express');

function jsonResponse(data) {
	if (data) {
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

const clientStore = new Map();

clientStore.set("0", {
	id: 0,
	requests: 0,
	limit: 10,
	rooms: 0,
	active: true,
});

module.exports = function () {
	const router = express.Router();
	const roomStore = new Map();

	function parseRoom(room) {
		return {
			id: room.id,
			queue: room.queue,
			state: room.state,
			viewers: room.userlist.size,
		};
	}

	/*
		Routes:
			/stats/:roomid
			/rooms
			/create
	*/

	router.get('/stats/:roomid', (req, res) => {
		const roomId = req.params.roomid;
		let room = roomStore.get(roomId);
		if (room) {
			res.send(jsonResponse({
				id: room.id,
				stats: {
					videosPlayed: room.history.size
				}
			}));
		} else {
			res.send(jsonResponse());
		}
	});

	router.get('/rooms', (req, res) => {
		const result = [];
		let maxResult = 50;
		let results = 0;
		for (let row of roomStore) {
			results++;
			const room = row[1];
			result.push(parseRoom(room));
			if (results >= maxResult) {
				break;
			}
		}
		res.send(jsonResponse(result));
	});

	router.use(function (req, res, next) {
		res.status(404);

		if (req.accepts('json')) {
			res.send(jsonResponse());
			return;
		}
	});

	return router;
}
