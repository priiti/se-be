const cluster = require('cluster');
const os = require('os');
const logger = require('./logger/logger');

if (cluster.isMaster) {
  const availableCPUCount = os.cpus().length;

  for (let i = 0; i < availableCPUCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      logger.warning('Worker %d crashed, starting a new worker', worker.id);
      cluster.fork();
    }
  });
} else {
  require('./index');
}
