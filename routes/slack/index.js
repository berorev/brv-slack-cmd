const express = require('express');
const createError = require('http-errors');
const brvcmdCommander = require('./brvcmd.commander');

const commanderMap = new Map([[brvcmdCommander.name, brvcmdCommander]]);

const router = express.Router();

router.post(
  '/command/:command', // ex) /command/brvcmd
  (req, res, next) => {
    // verification
    // if (!SlackUtils.isValidRequest(req)) {
    //   return next(createError(401, 'Verification token failed'));
    // }
    return next();
  },
  (req, res, next) => {
    // request parsing and validation
    const { command, text } = req.body; // command = "/brvcmd", text = <input>
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
    if (!text.includes(' ')) {
      return next(createError(400, 'Invalid format of input text'));
    }
    const [handlerName, args] = text.split(' ', 2);
    req.attrs = Object.assign(req.attrs || {}, { commander, handlerName, args });
    return next();
  },
  (req, res) => {
    const { commander, handlerName, args } = req.attrs;
    // dump command
    if (handlerName === 'dump') {
      const { path } = req;
      const headerJson = JSON.stringify(req.headers);
      const bodyJson = JSON.stringify(req.body);
      res.send(`path: ${path}\n\nheader: ${headerJson}\n\nbody: ${bodyJson}`);
    } else {
      commander
        .run(handlerName, args)
        .then((s) => res.send(s))
        .catch((e) => createError(500, e));
    }
  }
);

module.exports = router;
