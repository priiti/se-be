const MongoClient = require('mongodb');
const logger = require('./../logger/logger');

const getMongoURL = (options) => {
  const connectionString = process.env.MONGODB_URI;
  return connectionString;
};

const connect = (options, eventEmitter) => {
  eventEmitter.once('application.boot.finished', () => {
    MongoClient.connect(
      getMongoURL(options), {},
      (err, client) => {
        if (err) {
          eventEmitter.emit('database.error', err);
        }
        const db = client.db('stockExchange');
        logger.info('Database connected');
        eventEmitter.emit('database.connection.ready', db);
      }
    );
  });
};

module.exports = Object.assign({}, { connect });
