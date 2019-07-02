const { Commander } = require('./beans');
const { timeTrackService } = require('../../services');

const ttCommander = new Commander('tt')
  .setHandler('start', (s, userId) => timeTrackService.start(userId, s))
  .setHandler('stop', (s, userId) => timeTrackService.stop(userId))
  .setHandler('summary', (s, userId) => timeTrackService.summary(userId));

module.exports = ttCommander;
