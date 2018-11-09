const { validationResult } = require('express-validator/check');
const { ValidationError } = require('../errors');

const statusMap = {
    ValidationError: 400,
};

const expressValidatorErrorHandler = (req, res, next) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const { param, msg } = result.array()[0];
            throw new ValidationError(`${param ? `'${param}' ` : ''}${msg}`);
        }
        next();
    } catch (e) {
        next(e);
    }
};

const defaultErrorHandler = (err, req, res, next) => {
    const status = err.status || statusMap[err.name] || 500;
    if (status === 500) {
        console.log(err);
    }
    res.status(status).json({
        status,
        name: err.name !== 'StatusError' ? err.name : undefined,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = {
    expressValidatorErrorHandler,
    defaultErrorHandler,
};
