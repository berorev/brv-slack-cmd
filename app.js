// https://github.com/slackapi/template-slash-command-and-dialogs/blob/master/src/index.js

const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');

// if (!process.env.SLACK_SIGNING_SECRET) {
//   console.error('env.SLACK_SIGNING_SECRET not defined');
//   process.exit(1);
// }

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */
const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.use('/', router);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error occurred');
  console.error(err);
  res.status(err.status || 500).json({
    response_type: 'ephemeral',
    text: err.message || 'Internal Server Error'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`brv-slack-cmd listening on port ${port}.`);
});
