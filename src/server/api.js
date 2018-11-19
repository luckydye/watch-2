const express = require('express');
const { randomRoomId, parseVideoUrl } = require('./lib.js');

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

const clientStore = new Map();

clientStore.set("0", {
	id: 0,
	requests: 0,
	limit: 10,
	rooms: 0,
	active: true,
});

module.exports = {

	watchApi(io, rooms) {
		const router = express.Router();
		const roomStore = rooms.getRoomStore();

		router.get('/', (req, res) => res.send(jsonResponse()));
		
		router.get('/rooms', (req, res) => {
			const result = [];
			let maxResult = 50;
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

		router.get('/create', (req, res) => {
			const clientId = req.query.clientid;
			if(!clientId) {
				return res.send({ error: "Request needs a clientid" });
			}

			const client = clientStore.get(clientId);
			if(!client || !client.active) {
				return res.send({ error: "Not a valid clientid" });
			} else {
				client.requests += 1;
				console.log("[API] | Room Created", client);
			}

			// check client limit
			if(client.rooms >= client.limit) {
				return res.send({ error: "Room limit exceeded" });
			}

			const link = req.query.link;
			const parse = parseVideoUrl(link);
			if(parse) {
				newRoom = rooms.resolve(io, randomRoomId());
				client.rooms += 1;
				newRoom.addToQueue(parse.service, parse.id);
				setTimeout(() => {
					// remove room after 5 minutes without activity
					if(newRoom && newRoom.userlist.size < 1) {
						newRoom.delete();
						client.rooms -= 1;
						newRoom = null;
					}
				}, 5 * 60 * 1000);
				res.send({ roomid: newRoom.id });
			} else {
				return res.send("No valid video link");
			}
		});

		return router;
	}
};
