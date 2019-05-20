const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: true }));

app.post('/*', (req, res) => {
  res.send(`path: ${req.path}\n`);
  res.send(`query: ${JSON.stringify(req.query, null, 2)}\n`);
  res.send(`body: ${JSON.stringify(req.body, null, 2)}`);

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
