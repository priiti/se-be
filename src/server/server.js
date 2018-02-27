const express = require('express');
const morgan = require('morgan');
const stockExchangeAPI = require('./../api/stockExchangeAPI');
const { errorHandler } = require('./../utils/error');

const start = options => new Promise((resolve, reject) => {
  if (!options.stockExchangeService) {
    reject(new Error('Connected repository required'));
  }
  if (!options.port) {
    reject(new Error('Available port required'));
  }

  const app = express();

  app.use(morgan('dev'));

  stockExchangeAPI(app, options);

  app.use(errorHandler);

  const server = app.listen(options.port, () => resolve(server));
});

module.exports = Object.assign({}, { start });
