const asyncWrapper = require("../middlewares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const UserModel = require("../models/user.model");
const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");

const getCart = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;

    const updatedCart = await CartModel.findOne(
        { userId },
        { __v: false }
    ).populate("items.productId");

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: updatedCart });
});

const addToCart = asyncWrapper(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const { userId } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(
            AppError.create("Product Not Found", 404, httpStatusText.FAIL)
        );
    }

    const newCartItem = {
        productId,
        quantity,
    };

    const cart = await CartModel.findOne({ userId });

    const productIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );

    if (productIndex === -1 && quantity < 0) {
        return next(
            AppError.create("Product Not Found", 404, httpStatusText.FAIL)
        );
    }

    if (productIndex === -1) {
        cart.items.push(newCartItem);
    } else {
        const oldQuantity = cart.items[productIndex].quantity;
        const newQuantity = oldQuantity + quantity;

        if (newQuantity <= 0) {
            await CartModel.updateOne(
                { userId, "items.productId": productId },
                { $pull: { items: { productId } } }
            );

            const updatedCart = await CartModel.findOne(
                { userId },
                { __v: false }
            ).populate("items.productId");

            return res.status(200).json({
                status: httpStatusText.SUCCESS,
                data: updatedCart,
            });
        } else {
            cart.items[productIndex].quantity = newQuantity;
        }
    }

    await cart.save();

    const updatedCart = await CartModel.findOne(
        { userId },
        { __v: false }
    ).populate("items.productId");

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: updatedCart });
});

const updateCartItem = asyncWrapper(async (req, res, next) => {});

const removeCartItem = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    const { userId } = req.tokenPayload;

    await CartModel.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId } } }
    );

    const updatedCart = await CartModel.findOne({ userId }).populate(
        "items.productId"
    );

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: updatedCart });
});

const clearCart = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;

    const cart = await CartModel.findOne({ userId });

    cart.items = [];

    await cart.save();

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};
