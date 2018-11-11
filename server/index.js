const express = require('express');

const server = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const glob = require('glob');
const morgan = require('morgan');
const compression = require('compression');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const defaultRequestHandler = app.getRequestHandler();
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { infoLogger, errorLogger } = require('./configs/winston');
const config = require('../config.js');
const statisticsHelper = require('./utils/statisticsHelper');

const MONGODB_URI = config.MONGODB_URI;
const PORT = process.env.PORT || 3001;
const { defaultErrorHandler } = require('./utils/expressErrorHandlers');

app.prepare().then(() => {
  // Helmet
  server.use(helmet());

  // Cookie Parser
  server.use(cookieParser());

  // Parse application/x-www-form-urlencoded
  server.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  // Parse application/json
  server.use(bodyParser.json({ limit: '50mb' }));
  // Allows for cross origin domain request:
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Compression
  server.use(compression());

  // MongoDB
  mongoose.Promise = Promise;
  mongoose.connect(MONGODB_URI, { useMongoClient: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  // API routes
  const rootPath = path.normalize(`${__dirname}/..`);
  glob.sync(path.join(rootPath, '/server/routes/*.js')).forEach(controllerPath => require(controllerPath)(server));

  server.use(defaultErrorHandler);

  // Morgan
  server.use(morgan('combined', { stream: infoLogger.stream }));
  server.use(morgan('combined', { stream: errorLogger.stream }));

  // Next.js request handling
  const customRequestHandler = (page, req, res) => {
    // Both query and params will be available in getInitialProps({query})
    const mergedQuery = Object.assign({}, req.query, req.params);
    app.render(req, res, page, mergedQuery);
  };

  // Passport
  require('./configs/passport.js');
  statisticsHelper.init().catch(console.error);

  // Routes
  // server.get('/custom', customRequestHandler.bind(undefined, '/custom-page'));
  server.get('/sticker/:uuid', (req, res) => {
    const params = { uuid: req.params.uuid };
    return app.render(req, res, '/sticker', params);
  });

  server.get('/', customRequestHandler.bind(undefined, '/'));
  server.get('*', defaultRequestHandler);

  server.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}/\nAPI running on http://localhost:${PORT}/api/`);
  });
});
