class Commander {
  constructor(name) {
    this.name = name;
    this.handlers = new Map();
  }

  async run(handlerName, args) {
    const fn = this.handlers.get(handlerName);
    if (fn) {
      return fn(args);
    }
    throw new Error(`Undefined handler ${handlerName} at command ${this.name}`);
  }

  setHandler(handlerName, fn) {
    this.handlers.set(handlerName, fn);
    return this;
  }
}

module.exports = { Commander };
