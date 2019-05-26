const qs = require('querystring');

function urlEncode(s) {
  return qs.escape(s);
}

function urlDecode(s) {
  return qs.unescape(s);
}

function base64Encode(s) {
  return Buffer.from(s).toString('base64');
}

function base64Decode(s) {
  return Buffer.from(s, 'base64').toString('utf8');
}

module.exports = {
  urlEncode,
  urlDecode,
  base64Encode,
  base64Decode
};
