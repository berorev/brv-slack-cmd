const moment = require('moment');

class Task {
  constructor(text) {
    this.text = text;
    this.startTime = moment();
    this.endTime = null;
  }

  end() {
    this.endTime = moment();
  }

  get startTimeStr() {
    return Task.formatTime(this.startTime);
  }

  get endTimeStr() {
    return this.endTime ? Task.formatTime(this.endTime) : 'none';
  }

  get elapsedHours() {
    if (!this.endTime) {
      return -1;
    }
    return this.endTime.diff(this.startTime, 'hours', true).toFixed(1);
  }

  get summary() {
    return `${this.text} (${this.startTimeStr()} ~ ${this.endTimeStr()} / ${this.elapsedHours()})`;
  }

  static formatTime(m) {
    return m.utcOffset('+09:00').format('YYYY-MM-DD HH:mm:ss Z');
  }
}

class TimeTracker {
  constructor(userId) {
    this.userId = userId;
    this.tasks = [];
    this.currentTask = null;
  }

  start(text) {
    this.stop();

    const task = new Task(text);
    this.currentTask = task;
  }

  stop() {
    if (!this.currentTask) {
      return false;
    }
    this.currentTask.end();
    this.tasks.push(this.currentTask);
    this.currentTask = null;
    return true;
  }

  reset() {
    this.tasks = [];
    this.currentTask = null;
  }
}

class TimeTrackerStorage {
  constructor() {
    this.trackers = new Map();
  }

  get(userId) {
    let tracker = this.trackers.get(userId);
    if (!tracker) {
      tracker = new TimeTracker(userId);
      this.trackers.set(userId, tracker);
    }
    return tracker;
  }
}

const timeTrackerStorage = new TimeTrackerStorage();

function start(userId, text) {
  const tracker = timeTrackerStorage.get(userId);
  tracker.start(text);
}

function stop(userId) {
  const tracker = timeTrackerStorage.get(userId);
  tracker.stop();
}

function summary(userId) {
  const tracker = timeTrackerStorage.get(userId);
  return `
* Tasks:
  ${tracker.tasks.map((t, i) => `  ${i}. ${t.summary()}`).join('\n')}
* CurrentTask:
  * ${tracker.currentTask ? `${tracker.currentTask.summary()}` : 'none'}
  `.trim();
}

module.exports = { start, stop, summary };
