const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: true }));

app.post('/*', (req, res) => {
  const { path } = req;
  const headerJson = JSON.stringify(req.headers);
  const bodyJson = JSON.stringify(req.body);
  res.send(`path: ${path}\nheader: ${headerJson}, body: ${bodyJson}`);
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`brv-slack-bot listening on port ${port}.`);
});
