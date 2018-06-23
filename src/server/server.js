const proxy = require('express-http-proxy');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3031;

const api = require('./api.js');

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/api', api);

app.use('/', proxy(`http://localhost:8081/src/client`));

app.listen(PORT, () => console.log('App listening on port ' + PORT));