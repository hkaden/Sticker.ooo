
const arrayLengthValidator = ({ minLength, maxLength }) => ({
    validator: (value) => {
        console.log(value);
        let result = !!value;
        if (minLength != null) {
            result = result && value.length >= minLength;
        }
        if (maxLength != null) {
            result = result && value.length <= maxLength;
        }
        return result;
    },
    message: (minLength != null ? `{PATH} must have length >= ${minLength}.` : '') +
        (maxLength != null ? `{PATH} must have length <= ${maxLength}.` : ''),
});

module.exports = {
    arrayLengthValidator,
};
