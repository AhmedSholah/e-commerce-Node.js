const router = require("express").Router();
const isAuthenticated = require("../middlewares/asyncWrapper");
const checkRole = require("../middlewares/checkRole");
const {
    getAllOrders,
    createOrder,
    getOrder,
    getAllUsersOrders,
} = require("../controllers/order.controller");

router
    .route("/")
    .get(isAuthenticated, getAllOrders)
    .post(isAuthenticated, createOrder);

router.route("/:id").get(isAuthenticated, getOrder);
// .patch(isAuthenticatedupdateOrder)
// .delete(isAuthenticated, deleteOrder);

router
    .route("/admin")
    .get(isAuthenticated, checkRole(["admin"]), getAllUsersOrders);

module.exports = router;
