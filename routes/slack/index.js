const express = require('express');
const createError = require('http-errors');
const { SlackUtils } = require('../../utils');
const brvcmdCommander = require('./brvcmd.commander');
const ttCommander = require('./tt.commander');

const commanderMap = new Map([
  [brvcmdCommander.name, brvcmdCommander],
  [ttCommander.name, ttCommander]
]);

const router = express.Router();

router.post(
  '/command/:command', // ex) /command/brvcmd
  (req, res, next) => {
    // request parsing and validation
    const { command, text, user_id: userId } = req.body; // command = "/brvcmd", text = <input>, user_id = "U2147483697"
    const commanderName = req.params.command;
    if (command !== `/${commanderName}`) {
      return next(
        createError(400, `Invalid command : path variable(${commanderName}), body(${command})`)
      );
    }

    const commander = commanderMap.get(commanderName);
    if (!commander) {
      return next(createError(400, `Undefined command : ${commanderName}`));
    }

    const slackSigningSecret = process.env[`${commanderName.toUpperCase()}_SLACK_SIGNING_SECRET`];
    if (!slackSigningSecret || !SlackUtils.isValidRequest(req, slackSigningSecret)) {
      return next(createError(401, 'Verification token failed'));
    }

    const [handlerName, args] = text.includes(' ') ? text.split(' ', 2) : [text, ''];
    req.attrs = Object.assign(req.attrs || {}, { commander, handlerName, args, userId });
    return next();
  },
  (req, res) => {
    const { commander, handlerName, args, userId } = req.attrs;
    // dump command
    if (handlerName === 'dump') {
      const { path } = req;
      const headerJson = JSON.stringify(req.headers);
      const bodyJson = JSON.stringify(req.body);
      res.send(`path: ${path}\n\nheader: ${headerJson}\n\nbody: ${bodyJson}`);
    } else {
      commander
        .run(handlerName, args, userId)
        .then((s) => res.send(s))
        .catch((e) => createError(500, e));
    }
  }
);

module.exports = router;
