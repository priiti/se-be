const fileLogger = require('./../logger/fileLogger');
const { targetingLogsPath } = require('./../constants/file');
const stockExchangeServiceRules = require('./stockExchangeServiceRules');
const { Error } = require('./../utils/error');

/**
 * Sets up service for stock exchange
 * @param {*} options Options object for service to be used
 */
const service = (options) => {
  const { repository } = options;

  /**
   * Stock exchange service bid logic main function
   * @param {*} paramsObj URL parameters from API
   */
  const createBidForCompany = async (paramsObj) => {
    try {
      const companies = await repository.getCompaniesByParameters(paramsObj);

      if (companies.length < 1 || companies === undefined || companies === null) {
        const targetingLogsMessage = 'Base targeting failed';
        fileLogger.logRequestsIntoFile(targetingLogsPath, targetingLogsMessage);
      }

      const { countrycodes, categories, bid } = paramsObj;

      const filteredCompaniesList = await stockExchangeServiceRules
        .filterCompaniesByParameters(companies, countrycodes, categories);

      const hasBudgetCompanies = await stockExchangeServiceRules
        .checkForCurrentBudgetOnCompany(filteredCompaniesList, bid);

      const baseBidPassedCompanies = await stockExchangeServiceRules
        .checkForCompanyBaseBid(hasBudgetCompanies, bid);

      baseBidPassedCompanies.sort((a, b) => a.bid < b.bid);

      const winnerCompany = baseBidPassedCompanies[0];

      let message = 'Winner: ';
      message += winnerCompany._id;
      await fileLogger.logRequestsIntoFile(targetingLogsPath, message);

      const companyObjectValuesUpdated = stockExchangeServiceRules
        .reduceCompanyBudget(winnerCompany, bid);

      const updateDate = {
        country: companyObjectValuesUpdated.country,
        budget: companyObjectValuesUpdated.budget,
        bid: companyObjectValuesUpdated.bid,
        category: companyObjectValuesUpdated.category
      };

      const budgetUpdatedCompany = await repository.updateCompanyBudget(winnerCompany, updateDate);

      return budgetUpdatedCompany;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return Object.create({
    createBidForCompany
  });
};

/**
 * Register service for API usage
 * @param {*} options Options for service
 */
const registerService = options => new Promise((resolve, reject) => {
  resolve(service(options));
});

module.exports = Object.assign({}, { registerService });
