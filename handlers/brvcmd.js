const { endecodeService, krxService, maintenanceService } = require('../services');

class Commander {
  constructor() {
    this.commanders = new Map();
  }

  run(command, args) {
    const fn = this.commanders.get(command);
    if (fn) {
      return fn(args);
    }
    throw new Error(`Undefined command : ${command}`);
  }

  set(command, fn) {
    this.commanders.set(command, fn);
    return this;
  }
}

const commander = new Commander()
  .set('encode-b64', (s) => endecodeService.base64Encode(s))
  .set('decode-b64', (s) => endecodeService.base64Decode(s))
  .set('encode-url', (s) => endecodeService.urlEncode(s))
  .set('decode-url', (s) => endecodeService.urlDecode(s))
  .set('date2long', (s) => String(endecodeService.date2long(s)))
  .set('long2date', (s) => endecodeService.long2date(Number(s)))
  .set('stock', (code) => krxService.getStockSummary(code))
  .set('echo', (s) => maintenanceService.echo(s));

async function handle(command, args) {
  return commander.run(command, args);
}

module.exports = { handle };
