const router = require("express").Router();
const {
    getCategories,
    addCategory,
} = require("../controllers/categories.controller");
const validateSchema = require("../middlewares/validateSchema");
const categorySchema = require("../utils/validation/categoryValidation");

router.route("/").get(getCategories);
router.route("/").post(validateSchema(categorySchema), addCategory);
// router.route("/").patch(updateCategory);
// router.route("/").delete(deletCategory);

module.exports = router;
