const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

const api = require('./api.js');

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/api', api);

app.use('/node_modules', express.static('node_modules'));

app.use('/', express.static('./src/client/'));
app.use('/', (req, res) => {
	res.sendFile(path.resolve("./src/client/index.html"));
});

app.listen(PORT, () => console.log('App listening on port ' + PORT));