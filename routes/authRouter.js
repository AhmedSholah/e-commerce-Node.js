const router = require("express").Router();
const { register } = require("../controllers/auth.controller");

router.route("/register").post(register);
router.route("/login").post();

module.exports = router;
