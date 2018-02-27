const util = require('util');
const moment = require('moment');
const chalk = require('chalk');
const onFinished = require('on-finished');

const dotenv = require('dotenv');

dotenv.load({ path: '.env' });

const { log } = console;

let mail;

const getTimestamp = (date) => {
  let tempDate = date;
  if (!tempDate) { tempDate = new Date(); }
  return moment(tempDate).format('YYYY-MM-DD HH:mm:ss');
};

module.exports = (() => {
  const levels = {
    ERROR: { level: 0, name: 'ERR', color: 'red' },
    WARNING: { level: 1, name: 'WRN', color: 'yellow' },
    NOTICE: { level: 2, name: 'NOT', color: 'cyan' },
    INFO: { level: 3, name: 'INF', color: 'white' },
    DEBUG: { level: 4, name: 'DEB', color: 'gray' }
  };

  const output = (level, str) => {
    log(`[${
      chalk.dim(getTimestamp())
    } (${
      chalk[level.color](level.name)
    })] ${
      str}`);
  };

  const noop = () => {};

  // send email if neccessery
  mail = noop;

  const logFn = (levelObject) => {
    if (process.env.LOG_LEVEL < levelObject.level) return noop;
    return function () {
      output(levelObject, util.format.apply(this, arguments));
    };
  };


  return {
    middleWare() {
      const statusStyle = (status) => {
        if (status < 300) return chalk.green(status);
        if (status < 400) return chalk.yellow(status);
        return chalk.red(status);
      };

      return function (req, res, next) {
        const start = new Date();
        onFinished(
          res,
          () => {
            this.info(
              req.method,
              req.originalUrl,
              req.user && req.user.roles
                ? `${req.user.roles} ${req.user._id}`
                : (req.user && req.user._id) || 'guest',
              statusStyle(res.statusCode),
              `${new Date() - start}ms`
            );
          }
        );
        next();
      }.bind(this);
    },

    level: process.env.LOG_LEVEL,
    debug: logFn(levels.DEBUG),
    info: logFn(levels.INFO),
    notice: logFn(levels.DEBUG),
    warning: logFn(levels.WARNING),
    error() {
      mail({
        subject: `${process.env.APP_NAME} error`,
        message: util.format.apply(this, arguments)
      });
      if (this.level >= levels.ERROR.level) {
        output(levels.ERROR, util.format.apply(this, arguments));
      }
    }
  };
})();
