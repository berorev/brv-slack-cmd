const express = require('express');

const app = express();

app.get('/*', (req, res) => {
  console.log(req.path);
  console.log(req.query);
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`brv-slack-bot listening on port ${port}.`);
});
