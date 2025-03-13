const router = require("express").Router();
const isAuthenticated = require("../middlewares/asyncWrapper");
const checkRole = require("../middlewares/checkRole");

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
    .patch(isAuthenticated, updateUser);

// For Admin Use
router
    .route("/:id")
    .get(isAuthenticated, checkRole(["admin"]), getUser)
    .delete(isAuthenticated, deleteUser);

router.route("/me").get(isAuthenticated, getCurrentUser);

module.exports = router;
