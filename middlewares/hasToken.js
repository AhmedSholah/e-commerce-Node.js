const jwt = require("jsonwebtoken");

module.exports = function hasToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    const tokenPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.tokenPayload = tokenPayload;
    return next();
};
