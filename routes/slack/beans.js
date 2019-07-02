class Commander {
  constructor(name) {
    this.name = name;
    this.handlers = new Map();
  }

  async run(handlerName, args, userId) {
    const fn = this.handlers.get(handlerName);
    if (fn) {
      return fn(args, userId);
    }
    throw new Error(`Undefined handler ${handlerName} at command ${this.name}`);
  }

  setHandler(handlerName, fn) {
    this.handlers.set(handlerName, fn);
    return this;
  }
}

module.exports = { Commander };
