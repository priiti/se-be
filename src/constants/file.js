const path = require('path');

exports.defaultExternalClientLogsPath = (path.resolve(__dirname, './../logs/logs.txt')).toString();
exports.targetingLogsPath = (path.resolve(__dirname, './../logs/targeting_logs.txt')).toString();
