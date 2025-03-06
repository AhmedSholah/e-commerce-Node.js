const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

function validateSchema(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(
                AppError.create(
                    "Invalid request body",
                    400,
                    httpStatusText.FAIL
                )
            );
        }

        next();
    };
}

module.exports = validateSchema;
