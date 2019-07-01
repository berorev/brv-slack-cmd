const { Commander } = require('./beans');
const { endecodeService, krxService, maintenanceService } = require('../../services');

const brvcmdCommander = new Commander('brvcmd')
  .setHandler('encode-b64', (s) => endecodeService.base64Encode(s))
  .setHandler('decode-b64', (s) => endecodeService.base64Decode(s))
  .setHandler('encode-url', (s) => endecodeService.urlEncode(s))
  .setHandler('decode-url', (s) => endecodeService.urlDecode(s))
  .setHandler('date2long', (s) => String(endecodeService.date2long(s)))
  .setHandler('long2date', (s) => endecodeService.long2date(Number(s)))
  .setHandler('stock', (code) => krxService.getStockSummary(code))
  .setHandler('echo', (s) => maintenanceService.echo(s));

module.exports = brvcmdCommander;
