## Stock exchange

Used stack:
* Node.js
* MongoDb

Tried to build with repository pattern and separeted service logic, service rules, repository as a separate parts from API logic. Probably would have separated API in a separate server and service in a separate server to connect them with Docker, but instead separated service layer. Also I used cluster to fork several instances of application to load balance. It's also possible to run application in Docker containers so database with data would be included.

#### Usage:

* Start using Docker `docker compose up --build`. Docker compose includes MongoDb and adds data.

* `npm start` to start application in own machine, please be sure that MongoDb is running.

* `npm run cluster` to start application in cluster mode, please be sure that MongoDb running
* For making bid requests please use as e.g.: `CURL -X GET 'http://localhost:9000/?countrycode=FR&Category=Automobile&BaseBid=50'`

  * Picks parameters from url:
  * `countrycode=FR` (single country) or `countrycode=FR,US,RU` (multiple countries)
  * `Category=Automobile` (single category) or `Category=Automobile,IT` (multiple categories)
  * `BaseBid=50` in cents. Important to now that it will be used as cents for calculation

#### Explanations:

* I used MongoDb database. As I was a bit confused about the filtering part as you wished to have all the companies to be logged, I queried all companies by countrycodes and categories and did other the filtering logic later in `stockExchangeServiceRules.js` file to separate it from `stockExchangeService.js` file. Ideally I would have done this filtering during the query from MongoDb I think. Filtering is demonstrated later as a separate part including logging.
* Logging is used and each filtering result will be written into `targeting_logs.txt` file.

* Create bid functionality
* * API listens for path `'/'` and gets querystrings from that requst. Example URL: `http://localhost:9000/?countrycode=FR&Category=Automobile&BaseBid=50`
* * API picks parameters and passes them to service layer
* * Service layer has connection to repository for querying and updating documents. Also uses separate service rules for including logic etc.
* * `filterCompaniesByParameters` filters companies by base targeting countrycode(s) and categories
* * `checkForCurrentBudgetOnCompany` filters by budget available vs bid
* * `checkForCompanyBaseBid` filters by base bid vs company current bid
* * `reduceCompanyBudget` reduces budget and sets new bid value
* * `generateMessagePassedFailed` generates messages as requested for {Passed},{Failed}