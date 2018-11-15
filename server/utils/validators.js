const restrictedUsernames = require('./restrictedUsernames');

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

module.exports = {
  arrayLengthValidator,
  usernameIsNotRestrictedValidator,
  requestParameterValidator
};
