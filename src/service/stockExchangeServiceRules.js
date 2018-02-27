const fileLogger = require('./../logger/fileLogger');
const { targetingLogsPath } = require('./../constants/file');

/**
 * Generates messages for logging purposes
 * @param {*} passed Companies list passed filtering
 * @param {*} failed Companies list failed filtering
 */
const generateMessagePassedFailed = (passed, failed) => {
  let message = '';
  passed.forEach((p) => {
    message += `{${p._id}, Passed},`;
  });

  failed.forEach((f) => {
    message += `{${f._id}, Failed},`;
  });

  return `${message}`;
};

/**
 * Round values
 * @param {*} value Value to be rounded
 */
const roundValue = value => Number(`${Math.round(`${value}e2`)}e-2`);

/**
 * Filters companies by provided URL query parameters
 * @param {*} companiesList Companies list queried from database
 * @param {*} countryParameters Country parameters from URL
 * @param {*} categoryParameters Category parameters from URL
 */
const filterCompaniesByParameters =
    (companiesList, countryParameters, categoryParameters) => {
      const failedTargetingCompaniesList = [];

      const filteredCompaniesList = companiesList.filter((company) => {
        if (!countryParameters.some(c => company.country.includes(c))) {
          failedTargetingCompaniesList.push(company);
        } else {
          return company;
        }
        return null;
      });

      const companiesToRemove = [];

      filteredCompaniesList.filter((company) => {
        if (!categoryParameters.some(cat => company.category.includes(cat))) {
          failedTargetingCompaniesList.push(company);
          companiesToRemove.push(company);
        } else {
          return company;
        }
        return null;
      });

      if (companiesToRemove.length > 0) {
        companiesToRemove.forEach((company) => {
          const index = filteredCompaniesList.indexOf(company);
          filteredCompaniesList.splice(index, 1);
        });
      }

      if (filteredCompaniesList.length < 1) {
        const targetingLogsMessage = 'No Companies Passed from Targeting';
        fileLogger.logRequestsIntoFile(targetingLogsPath, targetingLogsMessage);
        throw new Error('No Companies Passed from Targeting');
      }

      if (filteredCompaniesList.length > 0) {
        let message = 'Base targeting: ';
        message += generateMessagePassedFailed(filteredCompaniesList, failedTargetingCompaniesList);
        fileLogger.logRequestsIntoFile(targetingLogsPath, message);
      }

      return filteredCompaniesList;
    };

/**
 * Checks for budget available for company
 * @param {*} companies Companies list after target filtering
 * @param {*} bid Base bid provided by external client in cents
 */
const checkForCurrentBudgetOnCompany = (companies, bid) => {
  const noBudgetCompanies = [];
  const hasBudgetCompanies = companies.filter((company) => {
    const companyCurrentBudget = roundValue(company.budget * 100);
    if ((bid > companyCurrentBudget) || (typeof bid !== 'number')) {
      noBudgetCompanies.push(company);
    } else {
      return company;
    }
    return null;
  });

  if (hasBudgetCompanies.length < 1) {
    const budgetLogsMessage = 'No Companies Passed from Budget';
    fileLogger.logRequestsIntoFile(targetingLogsPath, budgetLogsMessage);
    throw new Error('No Companies Passed from Budget');
  }

  if (hasBudgetCompanies.length > 0) {
    let message = 'Budget targeting: ';
    message += generateMessagePassedFailed(hasBudgetCompanies, noBudgetCompanies);
    fileLogger.logRequestsIntoFile(targetingLogsPath, message);
  }

  return hasBudgetCompanies;
};

/**
 * Checks if companies base bid is less than or equal to base bid provided by external client
 * @param {*} companies Companies list which still has available budget
 * @param {*} bid Base bid provided by external client in cents
 */
const checkForCompanyBaseBid = (companies, bid) => {
  const failedBaseBidPassingCompanies = [];
  const baseBidPassedCompanies = companies.filter((company) => {
    const companyCurrentBid = roundValue(company.bid * 100);
    if ((bid < companyCurrentBid) || (typeof bid !== 'number')) {
      failedBaseBidPassingCompanies.push(company);
    } else {
      return company;
    }
    return null;
  });

  if (baseBidPassedCompanies.length < 1) {
    const baseBidLogsMessage = 'No Companies Passed from BaseBid';
    fileLogger.logRequestsIntoFile(targetingLogsPath, baseBidLogsMessage);
    throw new Error('No Companies Passed from BaseBid');
  }

  if (baseBidPassedCompanies.length > 0) {
    let message = 'BaseBid targeting: ';
    message += generateMessagePassedFailed(baseBidPassedCompanies, failedBaseBidPassingCompanies);
    fileLogger.logRequestsIntoFile(targetingLogsPath, message);
  }

  return baseBidPassedCompanies;
};

/**
 * Reduces company budget but updating current object before DB update
 * @param {*} company Company which budget will be updated
 * @param {*} bid Base bid used by which budget and new bid will be updated
 */
const reduceCompanyBudget = (company, bid) => {
  const newBudgetValue = (roundValue((company.budget * 100)) - bid) / 100;
  const newBidValue = roundValue(bid / 100);

  const companyObjectValuesUpdated = {
    ...company,
    budget: newBudgetValue,
    bid: newBidValue
  };

  return companyObjectValuesUpdated;
};

module.exports = {
  filterCompaniesByParameters,
  checkForCurrentBudgetOnCompany,
  generateMessagePassedFailed,
  reduceCompanyBudget,
  checkForCompanyBaseBid
};
