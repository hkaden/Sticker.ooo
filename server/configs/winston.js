const winston = require('winston');
require('winston-daily-rotate-file');

const options = {
  infoFile: {
    level: 'info',
    filename: './logs/info/info-%DATE%.log',
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
    filename: './logs/error/error-%DATE%.log',
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

const consoleTransport = new winston.transports.Console(options.console);
const inforTransport = new winston.transports.DailyRotateFile(options.infoFile);
const errorTransport = new winston.transports.DailyRotateFile(options.errorFile);

const infoLogger = winston.createLogger({
  transports: [
    consoleTransport,
    inforTransport,
  ],
  exitOnError: false,
});

infoLogger.stream = {
  write(message, encoding) {
    infoLogger.info(message);
  },
};

const errorLogger = winston.createLogger({
  transports: [
    consoleTransport,
    errorTransport,
  ],
  exitOnError: false,
});

errorLogger.stream = {
  write(message, encoding) {
    errorLogger.error(message);
  },
};

module.exports = {
  infoLogger,
  errorLogger,
};
