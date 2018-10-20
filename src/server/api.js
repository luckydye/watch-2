const express = require('express');

const router = express.Router();

module.exports = router;

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

// Routs

router.get('/', (req, res) => {
	res.send(jsonResponse());
});
