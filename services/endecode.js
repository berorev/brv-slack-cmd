const moment = require('moment');
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

function date2long(s) {
  return moment(s).valueOf();
}

function long2date(l) {
  return moment(l)
    .utc()
    .format('YYYY-MM-DD[T]HH:mm:ss[Z]');
}

module.exports = {
  urlEncode,
  urlDecode,
  base64Encode,
  base64Decode,
  date2long,
  long2date
};
