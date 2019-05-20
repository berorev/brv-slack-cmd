// https://github.com/slackapi/template-slash-command-and-dialogs/blob/master/src/index.js

const express = require('express');
const bodyParser = require('body-parser');
const slackUtils = require('./slack_utils');

if (!process.env.SLACK_SIGNING_SECRET) {
  console.error('env.SLACK_SIGNING_SECRET not defined');
  process.exit(1);
}

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

app.post('/*', (req, res) => {
  if (slackUtils.isVerified(req)) {
    const { path } = req;
    const queryJson = JSON.stringify(req.query);
    const bodyJson = JSON.stringify(req.body);
    res.send(`path: ${path}\nquery: ${queryJson}\nbody: ${bodyJson}`);
  } else {
    // error
    res.status(401).json({
      response_type: 'ephemeral',
      text: 'Verification token mismatch'
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`brv-slack-bot listening on port ${port}.`);
});
