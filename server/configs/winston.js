const winston = require('winston');
require('winston-daily-rotate-file');

var options = {
  infoFile: {
    level: 'info',
    filename: `./logs/info/info-%DATE%.log`,
    zippedArchive: true,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: true,
  },
  errorFile: {
    level: 'error',
    name: 'file.error',
    filename: `./logs/error/error-%DATE%.log`,
    zippedArchive: true,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

let consoleTransport =  new winston.transports.Console(options.console);
let inforTransport = new winston.transports.DailyRotateFile(options.infoFile);
let errorTransport = new winston.transports.DailyRotateFile(options.errorFile);

let infoLogger =  winston.createLogger({
  transports: [
    consoleTransport,
    inforTransport
  ],
  exitOnError: false, 
});

infoLogger.stream = {
  write: function(message, encoding) {
    infoLogger.info(message);
  },
};

let errorLogger =  winston.createLogger({
    transports: [
        consoleTransport,
        errorTransport,
    ],
    exitOnError: false, 
  });
  
  errorLogger.stream = {
    write: function(message, encoding) {
        errorLogger.error(message);
    },
  };

module.exports = {
    infoLogger,
    errorLogger
};