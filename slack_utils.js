// https://github.com/slackapi/template-slash-command-and-dialogs/blob/master/src/verifySignature.js

const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');

const isVerified = (req) => {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  if (!signature) {
    console.debug('req.header["x-slack-signature"] not exist');
    return false;
  }
  if (!timestamp) {
    console.debug('req.headers["x-slack-request-timestamp"] not exist');
    return false;
  }

  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
  const [version, hash] = signature.split('=');

  // Check if the timestamp is too old
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (timestamp < fiveMinutesAgo) return false;

  hmac.update(`${version}:${timestamp}:${req.rawBody}`);

  // check that the request signature matches expected value
  return timingSafeCompare(hmac.digest('hex'), hash);
};

module.exports = { isVerified };
