const path = require('path');
const fs = require('fs');
const logger = require('./../logger/logger');

const createObjectFromJSON = filename => JSON.parse(fs.readFileSync(path.resolve(__dirname, filename), 'utf8'));

const insertSeedData = async (db) => {
  try {
    const data = await createObjectFromJSON('./companiesData.json');

    await db.collection('companies').remove({});
    await db.collection('companies').insertMany(data);
  } catch (err) {
    logger.error(err);
  }
};

module.exports = {
  insertSeedData
};
