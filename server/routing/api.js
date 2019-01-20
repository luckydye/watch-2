const express = require('express');
const { randomRoomId, parseVideoUrl } = require('../helper.js');
const Room = require('../rooms/Room.js');

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

module.exports = function(io) {
	const router = express.Router();
	const roomStore = Room.getRoomStore();

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
		if(room) {
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
		for(let row of roomStore) {
			results++;
			const room = row[1];
			result.push(parseRoom(room));
			if(results >= maxResult) {
				break;
			}
		}
		res.send(jsonResponse(result));
	});

	router.get('/create', (req, res) => {
		const clientId = req.query.clientid;
		const link = req.query.link;
		if(!clientId) {
			return res.send({ error: "Request needs a clientid" });
		}
		if(!link) {
			return res.send({ error: "Request needs a video link" });
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

		const parse = parseVideoUrl(link);
		if(parse) {
			newRoom = Room.resolve(io, randomRoomId());
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

	router.use(function(req, res, next){
		res.status(404);
		
		if (req.accepts('json')) {
			res.send(jsonResponse());
			return;
		}
	});

	return router;
}
