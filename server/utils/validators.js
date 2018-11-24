const { query } = require('express-validator/check');
const restrictedUsernames = require('./restrictedUsernames');
const { MESSAGES } = require('../configs/constants');

const arrayLengthValidator = ({ minLength, maxLength }) => ({
  validator: (value) => {
    let result = !!value;
    if (minLength != null) {
      result = result && value.length >= minLength;
    }
    if (maxLength != null) {
      result = result && value.length <= maxLength;
    }
    return result;
  },
  message: (minLength != null ? `{PATH} must have length >= ${minLength}.` : '')
        + (maxLength != null ? `{PATH} must have length <= ${maxLength}.` : ''),
});

const usernameIsNotRestrictedValidator = value => restrictedUsernames.findIndex(restricted => restricted === value.toLowerCase() === -1);

const requestParameterValidator = (string) => {
  const escape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(escape[match]));
}

const paginationValidators = (sortKeys) => [
  query('limit').optional().toInt().custom(v => v >= 1 && v <= 30)
    .withMessage(MESSAGES.VERIFY_QUERY_LIMIT),
  query('offset').optional().toInt().custom(v => v >= 0)
    .withMessage(MESSAGES.VERIFY_QUERY_OFFSET),
  query('sort').optional().isString()
    .isIn(sortKeys)
    .withMessage(MESSAGES.VERIFY_QUERY_SORT),
  query('order').optional().isString().customSanitizer(v => v.toLowerCase())
    .isIn(['asc', 'desc'])
    .withMessage(MESSAGES.VERIFY_QUERY_ORDER),
];

module.exports = {
  arrayLengthValidator,
  usernameIsNotRestrictedValidator,
  requestParameterValidator,
  paginationValidators,
};
