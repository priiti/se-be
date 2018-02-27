const HTTPstatus = require('http-status');

module.exports = (app, options) => {
  const { stockExchangeService } = options;

  app.get('/', async (req, res, next) => {
    try {
      const { countrycode, Category, BaseBid } = req.query;
      if (!countrycode || !Category || !BaseBid) {
        return res.status(HTTPstatus.UNPROCESSABLE_ENTITY).json({ message: 'No companies passed from targeting' });
      }

      // Parameters ready before creating a bid
      const cCode = countrycode.split(',');
      const cCategory = Category.split(',');
      const bid = parseInt(BaseBid, 10);

      const queryObj = {
        countrycodes: cCode,
        categories: cCategory,
        bid
      };

      const company = await stockExchangeService.createBidForCompany(queryObj);

      if (company.length < 1 || company === undefined || company === null) {
        return res.status(HTTPstatus.UNPROCESSABLE_ENTITY).json({ message: 'No companies passed from targeting' });
      }

      res.status(HTTPstatus.OK).json(company);
    } catch (err) {
      next(err);
    }
  });
};
