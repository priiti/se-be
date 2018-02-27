require('dotenv').config({ path: '.env' });
const { EventEmitter } = require('events');
const server = require('./server/server');
const companyRepository = require('./repository/companyRepository');
const stockExchangeService = require('./service/stockExchangeService');
const configuration = require('./configuration');
const logger = require('./logger/logger');
const { insertSeedData } = require('./seed/data');

const eventEmitter = new EventEmitter();

process.on('uncaughtException', (err) => {
  logger.error('Unhandled Exception', err);
});

process.on('uncaughtRejection', (err, promise) => {
  logger.error('Unhandled Rejection', err);
});

eventEmitter.on('database.connection.ready', async (db) => {
  try {
    await insertSeedData(db);

    const repo = await companyRepository.connect({ db, ObjectID: configuration.ObjectID });

    const service = await stockExchangeService
      .registerService({ repository: repo, ObjectID: configuration.ObjectID });

    const runningServer = await server
      .start({ port: configuration.serverSettings.port, stockExchangeService: service });

    runningServer.on('close', () => {
      repo.disconnect();
    });

    logger.info(`Server started successfully, running on port ${configuration.serverSettings.port}`);
  } catch (err) {
    logger.error(err);
  }
});

eventEmitter.on('database.error', (err) => {
  process.exit(1);
  logger.error(err);
});

configuration.db.connect(configuration.dbSettings, eventEmitter);

eventEmitter.emit('application.boot.finished');
