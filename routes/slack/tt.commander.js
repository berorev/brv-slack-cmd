const { Commander } = require('./beans');
const { timeTrackService } = require('../../services');

const ttCommander = new Commander('tt')
  .setHandler('start', (s, userId) => {
    const task = timeTrackService.start(userId, s);
    return `"${task.text}" started.`;
  })
  .setHandler('stop', (s, userId) => {
    const task = timeTrackService.stop(userId);
    return task ? `"${task.text}" stopped.` : `No task to stop.`;
  })
  .setHandler('reset', (s, userId) => {
    timeTrackService.reset(userId);
    return 'Reset all time tracking tasks.';
  })
  .setHandler('summary', (s, userId) => timeTrackService.summary(userId));

module.exports = ttCommander;
