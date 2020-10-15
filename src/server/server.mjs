import express from 'express';
import bodyParser from 'body-parser';
import Lobby from './Lobby.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/lobby', (req, res) => {
  if(req.body) {
    const peer = req.body.id;
    const lobby = new Lobby(peer);
    res.send(lobby.toJson());
  }
});

app.get('/lobbies', (req, res) => {
  res.send({
    status: 200,
    error: null,
    data: {
      lobbies: Lobby.getList()
    }
  });
});

app.get('/lobby/:id', (req, res) => {
  const id = req.params.id;
  const lobby = Lobby.get(id);

  if(lobby) {
    res.send({
      status: 200,
      error: null,
      data: lobby.toJson()
    });
  } else {
    res.send({
      status: 404,
      error: "Lobby does not exist."
    });
  }
});

app.use('/', express.static('public'));
app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
  res.send({
    status: 404,
    error: "Not found."
  });
});

app.listen(port, () => {
  console.log(`Service listening at port ${port}`);
});
