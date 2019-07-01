const express = require('express');
const slackRouter = require('./slack');

const router = express.Router();

router.use('/slack', slackRouter);

module.exports = router;
