const asyncWrapper = require("../middlewares/asyncWrapper");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const CartModel = require("../models/cart.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

const getAllOrders = asyncWrapper(async (req, res, next) => {});

const createOrder = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const { shippingAddress, paymentMethod } = req.body;
    const cart = await CartModel.findById(userId);

    if (!cart.items || cart.items.length == 0) {
        return next(AppError.create("No Order Items Found"));
    }
});

const getOrder = asyncWrapper(async (req, res, next) => {});

const getAllUsersOrders = asyncWrapper(async (req, res, next) => {});

module.exports = {
    getAllOrders,
    createOrder,
    getOrder,
    getAllUsersOrders,
};
