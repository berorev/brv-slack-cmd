const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: true }));

app.post('/*', (req, res) => {
  const { path } = req;
  const queryJson = JSON.stringify(req.query);
  const bodyJson = JSON.stringify(req.body);
  res.send(`path: ${path}\nquery: ${queryJson}\nbody: ${bodyJson}`);

  // error
  // res.contentType('application/json');
  // {
  //   "response_type": "ephemeral",
  //   "text": "Sorry, that didn't work. Please try again."
  // }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`brv-slack-bot listening on port ${port}.`);
});
