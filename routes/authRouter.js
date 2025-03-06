const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");
const validateSchema = require("../middlewares/validateSchema");
const {
    registerSchema,
    loginSchema,
} = require("../utils/validation/authValidation");

router.route("/register").post(validateSchema(registerSchema), register);
router.route("/login").post(validateSchema(loginSchema), login);

module.exports = router;
