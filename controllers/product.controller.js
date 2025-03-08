const asyncWrapper = require("../middlewares/asyncWrapper");
const ProductModel = require("../models/product.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

const getProducts = asyncWrapper(async (req, res, next) => {
    const products = await ProductModel.find({});
    if (!products) {
        return next(
            AppError.create("No Products Found", 404, httpStatusText.FAIL)
        );
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { products } });
});

const getOneProduct = asyncWrapper(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
        return next(
            AppError.create("Product Not Found", 404, httpStatusText.FAIL)
        );
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { product } });
});

// Add One Product (Seller - Admin)
const addOneProduct = asyncWrapper(async (req, res, next) => {
    const product = req.body;
    product.soldBy = req.tokenPayload.id;

    await ProductModel.create(product);
    return res.json({
        status: httpStatusText.SUCCESS,
        data: { message: "Product created successfully." },
    });
});

// Update One Product (Seller that add the product - Admin)
const updateOneProduct = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    const oldProduct = await ProductModel.findById(productId);

    if (!(oldProduct.soldBy == req.tokenPayload.id)) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    const product = req.body;
    product.modifiedAt = new Date();

    await ProductModel.updateOne({ _id: productId }, { $set: product });

    const updatedProduct = await ProductModel.findById(productId);

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: updatedProduct,
    });
});

// Delete One Product (Seller - Admin)
const deleteOneProduct = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    const oldProduct = await ProductModel.findById(productId);

    if (!oldProduct) {
        return next(
            AppError.create("Product not found", 404, httpStatusText.FAIL)
        );
    }

    if (
        req.tokenPayload.role === "admin" ||
        oldProduct.soldBy == req.tokenPayload.id
    ) {
        await ProductModel.deleteOne({ _id: productId });

        return res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: null,
        });
    } else {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }
});

module.exports = {
    getProducts,
    getOneProduct,
    addOneProduct,
    updateOneProduct,
    deleteOneProduct,
};
