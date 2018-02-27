/**
 * Repository for usage in service layer
 * @param {*} connection Database connection
 */
const repository = (connection) => {
  const { db } = connection;

  /**
   * Get all companies from database
  */
  const getCompaniesList = () => new Promise((resolve, reject) => {
    const companies = [];
    const query = {};
    const projection = {};
    const cursor = db.collection('companies').find(query, projection);

    const addCompany = (company) => {
      companies.push(company);
    };

    const sendCompanies = (err) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(companies);
    };

    cursor.forEach(addCompany, sendCompanies);
  });

  /**
   * Return companies by query parameters, used paramters countrycodes and categories
   * @param {*} queryParams Query parameters picked from URL
   */
  const getCompaniesByParameters = queryParams => new Promise((resolve, reject) => {
    const { countrycodes, categories } = queryParams;

    const companies = [];
    const query = {
      $and: [{
        country: { $in: countrycodes },
        category: { $in: categories }
      }]
    };
    const projection = {};
    const cursor = db.collection('companies').find(query, projection);

    const addCompany = (company) => {
      companies.push(company);
    };

    const sendCompanies = (err) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(companies);
    };

    cursor.forEach(addCompany, sendCompanies);
  });

  /**
   * Update company data
   * @param {*} company Company to be updated
   * @param {*} updateData Data which should be updated for the company
   */
  const updateCompanyBudget = (company, updateData) => new Promise((resolve, reject) => {
    const query = {
      _id: company._id
    };

    const options = {
      returnOriginal: false
    };

    db.collection('companies').findOneAndUpdate(query, updateData, options, (err, doc) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(doc.value);
    });
  });

  /**
   * Disconnect database
   */
  const disconnect = () => {
    db.connection.close();
  };

  return Object.create({
    getCompaniesList,
    getCompaniesByParameters,
    updateCompanyBudget,
    disconnect
  });
};

/**
 * Database connection for repository
 * @param {*} connection Database connection provided for repository
 */
const connect = connection => new Promise((resolve, reject) => {
  if (!connection) {
    reject(new Error('Database connection not provided'));
  }

  resolve(repository(connection));
});

module.exports = Object.assign({}, { connect });
