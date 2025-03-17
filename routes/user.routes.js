const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const userValidation = require("../utils/validation/userValidation");

const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getCurrentUser,
} = require("../controllers/user.controller");

router
    .route("/")
    .get(isAuthenticated, checkRole(["admin"]), getAllUsers)
    .patch(
        isAuthenticated,
        validateSchema(userValidation.updateUserSchema),
        updateUser
    );

// For Admin Use
// router
//     .route("/:id")
//     .get(isAuthenticated, checkRole(["admin"]), getUser)
//     .delete(isAuthenticated, deleteUser);

router.route("/me/user").get(isAuthenticated, getCurrentUser);

module.exports = router;
