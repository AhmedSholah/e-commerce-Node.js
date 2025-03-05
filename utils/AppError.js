class AppError extends Error {
    constructor() {
        super();
    }

    create(message, statusCode, statusText) {
        this.statusText = statusText;
        this.message = message;
        this.statusCode = statusCode;
        return this;
    }
}

module.exports = new AppError();
