const asyncWrapper = require("../middlewares/asyncWrapper");
const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");
const UserModel = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utils/s3.utils");
const FavoriteModel = require("../models/favorite.model");

const getProducts = asyncWrapper(async (req, res, next) => {
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

    if (query.instock !== undefined) {
        if (query.instock) {
            filter.quantity = { $gt: 0 };
        } else {
            filter.quantity = { $eq: 0 };
        }
    }

    const products = await ProductModel.find(filter, { __v: false })
        .populate({ path: "soldBy", select: "_id firstName" })
        .sort({ [query.sortBy]: query.sortOrder })
        .skip(skip)
        .limit(limit);

    // get total number of products for pagination
    const productsCount = await ProductModel.countDocuments(filter);

    // get highest priced product
    const highestPricedProduct = await ProductModel.findOne()
        .sort({ price: -1 })
        .select("price");

    // Return 4 products Randomly until fix it soon with best products according to views
    const total = await ProductModel.countDocuments();
    const randomSkip = Math.max(0, Math.floor(Math.random() * (total - 4)));

    const bestSellingProducts = await ProductModel.find({}, { __v: 0 })
        .skip(randomSkip)
        .limit(4)
        .populate("soldBy", "_id firstName");

    if (!products) {
        return next(
            AppError.create("Product Not Found", 404, httpStatusText.FAIL)
        );
    }

    return res.json({
        status: httpStatusText.SUCCESS,
        data: {
            productsCount,
            products,
            bestSellingProducts,
            highestPricedProduct,
        },
    });
});

const getOneProduct = asyncWrapper(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId, {
        __v: false,
    }).populate({ path: "soldBy", select: "_id firstName" });

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

    // check if category exists or not
    const categoryExists = await CategoryModel.findById(product.category);

    if (!categoryExists) {
        return next(
            AppError.create("Category Not Found", 404, httpStatusText.FAIL)
        );
    }

    const proudct = await ProductModel.create(product);

    return res.json({
        status: httpStatusText.SUCCESS,
        data: { message: "Product created successfully.", id: proudct._id },
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

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    await ProductModel.findByIdAndDelete(productId);

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

const addProductImage = asyncWrapper(async (req, res, next) => {
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

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    // const deleteCommand = new DeleteObjectCommand({
    //     Bucket: "main",
    //     Key: product.image,
    // });

    // if (product.image) {
    //     try {
    //         await s3Client.send(deleteCommand);
    //     } catch (error) {}
    // }

    const newImagePath = `products/${productId}/image-${Date.now()}.${
        req.file.mimetype.split("/")[1]
    }`;

    const params = {
        Bucket: "main",
        Key: newImagePath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
        await s3Client.send(command);
        product.imageNames.push(newImagePath);
        await product.save();
    } catch (error) {
        return next(
            AppError.create(
                "Error uploading new image",
                500,
                httpStatusText.FAIL
            )
        );
    }

    await res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            image: `${process.env.AWS_S3_PUBLIC_BUCKET_URL}${newImagePath}`,
        },
    });
});

const deleteProductImage = asyncWrapper(async (req, res, next) => {
    const { productId, imageIndex } = req.params;
    const { userId, role } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(
            AppError.create("Product not found", 404, httpStatusText.FAIL)
        );
    }

    const isAdmin = role === "admin";
    const isOwner = product.soldBy.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    const imageToDelete = product.imageNames[imageIndex];

    if (!imageToDelete) {
        return next(
            AppError.create("Image not found", 404, httpStatusText.FAIL)
        );
    }
    const deleteCommand = new DeleteObjectCommand({
        Bucket: "main",
        Key: imageToDelete,
    });
    try {
        await s3Client.send(deleteCommand);
        product.imageNames.splice(imageIndex, 1);
        await product.save();
    } catch (error) {
        return next(
            AppError.create("Error deleting image", 500, httpStatusText.FAIL)
        );
    }

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
    addProductImage,
    deleteProductImage,
};
