const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const {nanoid} = require('nanoid');

const app = express();
const port = 8000;

expressWs(app);

app.use(express.json());
app.use(cors());

const connections = {};

const circles = [];

app.ws('/circles', function (ws, req) {
  const id = nanoid();
  console.log(`client connected id=' + ${id}`);

  connections[id] = ws;

  console.log('total clients connected: ' + Object.keys(connections).length);

  ws.send(JSON.stringify({
    type: 'LAST_CIRCLES',
    circle:circles
  }));

  ws.on('message', (msg) => {
    console.log(`Incoming message from ${id}: `, msg);

    const parsed = JSON.parse(msg);

    switch (parsed.type) {
      case 'CREATE_CIRCLE':
        Object.keys(connections).forEach(connId => {
          const connection = connections[connId];
          const newCircle = {
            circle: parsed.circle
          };

          connection.send(JSON.stringify({
            type: 'NEW_CIRCLE',
            ...newCircle
          }));

          circles.push(newCircle);

          if (circles.length > 20) {
            circles.splice(0, 1);
          }
        });
        break;

      default:
        console.log('NO TYPE: ' + parsed.type);
    }
  });

  ws.on('close', (msg) => {
    console.log(`client disconnected! ${id}`);

    delete connections[id];
  });
});

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});

