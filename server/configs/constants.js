const TYPES = {
    USERNAME_OR_EMAIL_EXIST: 'USERNAME_OR_EMAIL_EXIST',
    FAILED_TO_REGISTER: 'FAILED_TO_REGISTER',
    FAILED_TO_SEND_TOKEN: 'FAILED_TO_SEND_TOKEN',
    FAILED_TO_LOGIN: 'FAILED_TO_LOGIN',
    FAILED_TO_SEND_VERIFICATION_EMAIL: 'FAILED_TO_SEND_VERIFICATION_EMAIL',
    VERIFICATION_EMAIL_SENT: 'VERIFICATION_EMAIL_SENT',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    ACCOUNT_VERIFIED: 'ACCOUNT_VERIFIED',
    ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',
    ACCOUNT_NOT_MATCH_TOKEN: 'ACCOUNT_NOT_MATCH_TOKEN',
    ACCOUNT_ALREADY_BEEN_VERIFIED: 'ACCOUNT_ALREADY_BEEN_VERIFIED',
    ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED'
};

const MESSAGES = {
    USERNAME_OR_EMAIL_EXIST: 'Username or email already exists',
    IS_REQUIRE: 'is required',
    IS_NOT_VALID_USERNAME: 'is not a valid username',
    PASSWORD_NOT_MATCH: 'Passwords do not match',
    VERIFY_USERNAME: 'must be within 4 to 20 characters',
    VERFIY_PASSWORD: 'must be at least 6 characters',
    VERIFY_IMAGE: 'Image should not be larger than 100kb',
    FAILED_TO_REGISTER: 'Failed to register',
    FAILED_TO_LOGIN: 'Failed to login',
    FAILED_TO_SEND_TOKEN: 'Failed to send token',
    FAILED_TO_MATCH_USER: 'Failed to match user',
    FAILED_TO_VERIFY_ACCOUNT: 'Failed to verify the account',
    FAILED_TO_SEND_VERIFICATION_EMAIL: 'Failed to send a verification email',
    INVALID_TOKEN: 'Invalid Token',
    INVALID_DATAURL: 'Invalid dataUrl',
    ACCOUNT_ALREADY_VERIFIED: 'The account has been verified',
    ACCOUNT_ALREADY_BEEN_VERIFIED: 'The account has already been verified',
    ACCOUNT_NOT_VERIFIED: 'Your account has not been verified',
    LOGIN_SUCCESS: 'Login Successfully',
    VERIFICATION_EMAIL_SENT_SUCCESS: 'A verification email has been sent to '
};


module.exports = {
    TYPES,
    MESSAGES
}