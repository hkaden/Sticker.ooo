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
const { logger, httpLogger } = require('./configs/winston');
const statisticsHelper = require('./utils/statisticsHelper');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;
const { defaultErrorHandler } = require('./utils/expressErrorHandlers');
const jwt = require('jsonwebtoken');
const cert = fs.readFileSync(`${__dirname}/public.pem`);

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
  server.use(morgan('combined', {
    skip: (req, res) => res.statusCode >= 400,
    stream: httpLogger.infoStream,
  }));
  server.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: httpLogger.errorStream,
  }));

  // Next.js request handling
  const customRequestHandler = (page, req, res) => {
    // Both query and params will be available in getInitialProps({query})
    const mergedQuery = Object.assign({}, req.query, req.params);
    app.render(req, res, page, mergedQuery);
  };


  const redirectIfLoggedIn = (req, res) => {
    const token = req.cookies.jwtToken;
    if(token != undefined && token != null) {
      return jwt.verify(token, cert, { algorithm: 'RS256' }, function(err, payload) {
        if(err) {
          return app.render(req, res, req.path);
        }
        return res.redirect('/list');
      });
    } else {
      return app.render(req, res, req.path);
    } 
  }

  const validateJwtTokenBeforeRender = (req, res) => {
    const token = req.cookies.jwtToken;
    if(token == undefined || token == null) {
      return res.redirect('/login')
    } else {
      return jwt.verify(token, cert, { algorithm: 'RS256' }, function(err, payload) {
        if(err) {
          return res.redirect('/login')
        }
        return app.render(req, res, req.path);
      });
    }
  }

  // Passport
  require('./configs/passport.js');
  statisticsHelper.init().catch(console.error);

  // Routes
  // server.get('/custom', customRequestHandler.bind(undefined, '/custom-page'));
  server.get('/sticker/:uuid', (req, res) => {
    const params = { uuid: req.params.uuid };
    return app.render(req, res, '/sticker', params);
  });

  server.get('/login', redirectIfLoggedIn);
  server.get('/submit', validateJwtTokenBeforeRender);
  //server.get('/', (req, res) => res.redirect('/submit'))

  server.get('/', customRequestHandler.bind(undefined, '/'));
  server.get('*', defaultRequestHandler);

  server.listen(PORT, () => {
    logger.info(`App running on http://localhost:${PORT}/`)
    logger.info(`API running on http://localhost:${PORT}/api/`);
  });
});
