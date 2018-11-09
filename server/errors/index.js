class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

class StatusError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "StatusError";
        this.status = status;
    }
}

module.exports = {
    ValidationError,
    StatusError,
}
