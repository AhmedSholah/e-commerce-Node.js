const router = require("express").Router();
const {
    getCategories,
    addCategory,
} = require("../controllers/category.controller");
const validateSchema = require("../middlewares/validateSchema");
const { categorySchema } = require("../utils/validation/categoryValidation");

const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");

router
    .route("/")
    .get(getCategories)
    .post(
        isAuthenticated,
        validateSchema(categorySchema),
        checkRole(["admin"]),
        addCategory
    );
// .patch(updateCategory)
// .delete(deletCategory);

module.exports = router;
