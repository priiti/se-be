const fs = require('fs');
const moment = require('moment');

const getTimestamp = (date) => {
  let datetime = date;
  if (!datetime) {
    datetime = new Date();
  }
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const logRequestsIntoFile = (filePath, data) =>
  new Promise((resolve, reject) => {
    const message = `${getTimestamp()}: ${data}`;
    fs.appendFile(filePath, `${message}\n`, 'utf8', (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

module.exports = Object.assign({}, { logRequestsIntoFile });
