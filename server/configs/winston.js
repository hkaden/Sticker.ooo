const winston = require('winston');
require('winston-daily-rotate-file');

const formatError = winston.format((_info) => {
  let info = _info;
  if (info instanceof Error) {
    info = JSON.stringify(err, Object.getOwnPropertyNames(err))
  }
  return info;
})

const consoleFormat = winston.format.printf((info) => {
  if (info instanceof Error) {
    console.log('iserror');
  }
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

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
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      consoleFormat,
    ),
  },
};

const consoleTransport = new winston.transports.Console(options.console);
const infoTransport = new winston.transports.DailyRotateFile(options.infoFile);
const errorTransport = new winston.transports.DailyRotateFile(options.errorFile);

const defaultLogger = winston.createLogger({
  transports: [
    consoleTransport,
    infoTransport,
    errorTransport,
  ],
  exitOnError: false,
  format: formatError(),
});

defaultLogger.infoStream = {
  write(message, encoding) {
    defaultLogger.info(message);
  },
};

defaultLogger.errorStream = {
  write(message, encoding) {
    defaultLogger.error(message);
  },
};


const httpLogger = winston.createLogger({
  transports: [
    infoTransport,
    errorTransport,
  ],
  exitOnError: false,
});

httpLogger.infoStream = {
  write(message, encoding) {
    httpLogger.info(message);
  },
};

httpLogger.errorStream = {
  write(message, encoding) {
    httpLogger.error(message);
  },
};

module.exports = {
  logger: defaultLogger,
  httpLogger,
};
