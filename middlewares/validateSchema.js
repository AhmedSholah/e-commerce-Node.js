const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

function validateSchema(schema, validationTarget = "body") {
    let validationData;
    return (req, res, next) => {
        switch (validationTarget) {
            case "body":
                validationData = req.body;
                break;
            case "query":
                validationData = req.query;
                break;
            case "params":
                validationData = req.params;
                break;

            default:
                validationData = req.body;
                break;
        }
        const result = schema.safeParse(validationData);

        if (!result.success) {
            return next(
                AppError.create(
                    `Invalid request ${validationTarget}`,
                    400,
                    httpStatusText.FAIL
                )
            );
        }

        next();
    };
}

module.exports = validateSchema;
