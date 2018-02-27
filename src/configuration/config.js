const dbSettings = {

};

const serverSettings = {
  port: process.env.PORT || 9000
};

module.exports = Object.assign({}, { dbSettings, serverSettings });
