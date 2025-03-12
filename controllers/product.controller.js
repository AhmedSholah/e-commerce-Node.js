const asyncWrapper = require("../middlewares/asyncWrapper");
const ProductModel = require("../models/product.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const { getProductsSchema } = require("../utils/validation/productValidation");

const getProducts = asyncWrapper(async (req, res, next) => {
    const result = getProductsSchema.safeParse(req.query);

    if (!result.success) {
        return next(
            AppError.create(
                "Invalid query parameters",
                400,
                httpStatusText.FAIL
            )
        );
    }

    const query = req.query;
    const limit = query.limit || 4;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.minPrice || query.maxPrice) {
        filter.price = {
            $gte: query.minPrice || 0,
            $lte: query.maxPrice || 1e9,
        };
    }

    if (query.category) {
        filter.category = { $in: query.category };
    }

    if (query.instock) {
        if (query.instock === "true") {
            filter.quantity = { $gt: 0 };
        } else {
            filter.quantity = { $eq: 0 };
        }
    }

    const products = await ProductModel.find(filter, { __v: false })
        .populate({ path: "soldBy", select: "_id username" })
        .sort({ [query.sortBy]: query.sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();

    if (!products) {
        return next(
            AppError.create("Product Not Found", 404, httpStatusText.FAIL)
        );
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { products } });
});

const getOneProduct = asyncWrapper(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId, {
        __v: false,
    }).populate({
        path: "soldBy",
        select: "_id username",
    });

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
    product.soldBy = req.tokenPayload.userId;

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

    if (!oldProduct) {
        return next(
            AppError.create("Product Not Found", 404, httpStatusText.FAIL)
        );
    }

    if (!(oldProduct.soldBy == req.tokenPayload.userId)) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    const product = req.body;

    await ProductModel.updateOne({ _id: productId }, { $set: product });

    const updatedProduct = await ProductModel.findById(productId);

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: updatedProduct,
    });
});

// Delete One Product (Seller - Admin)
const deleteOneProduct = asyncWrapper(async (req, res, next) => {
    const { productId } = req.params;
    const { userId, role } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(
            AppError.create("Product not found", 404, httpStatusText.FAIL)
        );
    }

    const isAdmin = role === "admin";
    const isOwner = product.soldBy.toString() === userId.toString();

    console.log(isAdmin);
    console.log(isOwner);

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    await ProductModel.findByIdAndDelete(productId);

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

module.exports = {
    getProducts,
    getOneProduct,
    addOneProduct,
    updateOneProduct,
    deleteOneProduct,
};
