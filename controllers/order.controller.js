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

    const cart = await CartModel.findOne({ user: userId }).populate(
        "items.product"
    );

    if (!cart.items || cart.items.length == 0) {
        return next(AppError.create("Cart Is Empty"));
    }
    // let totalPrice = 0;
    // let orderItemsArr = [];

    // for (let item of cart.items) {
    //     const product = item.product;

    //     if (product.quantity < item.quantity) {
    //         return next(AppError.create(`${product.name} is out of stock`));
    //     }
    //     let finalPrice = product.price;
    //     if (product.discountAmount > 0) {
    //         finalPrice -= product.discountAmount;
    //     } else if (product.discountPercentage > 0) {
    //         finalPrice -= (product.price * product.discountPercentage) / 100;
    //     }
    //     if (finalPrice < 0) finalPrice = 0;
    //     totalPrice += finalPrice * item.quantity;

    //     product.quantity -= item.quantity;
    //     await product.save();
    // }
});
// a
const getOrder = asyncWrapper(async (req, res, next) => {});

const getAllUsersOrders = asyncWrapper(async (req, res, next) => {});

module.exports = {
    getAllOrders,
    createOrder,
    getOrder,
    getAllUsersOrders,
};
