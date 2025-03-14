const mongoose = require("mongoose");
const asyncWrapper = require("../middlewares/asyncWrapper");
const categoryModel = require("../models/category.model");
const ProductModel = require("../models/product.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

const getCategories = asyncWrapper(async (req, res, next) => {
    const categories = await categoryModel.find({});
    if (!categories) {
        return next(
            AppError.create("No Categories Found", 404, httpStatusText.FAIL)
        );
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { categories } });
});

const addCategory = asyncWrapper(async (req, res, next) => {
    const { name } = req.body;
    const oldCategory = await categoryModel.findOne({ name });

    if (oldCategory) {
        return next(
            AppError.create("Categorie Already Exist", 409, httpStatusText.FAIL)
        );
    }

    await categoryModel.create({ name });

    return res.json({
        status: httpStatusText.SUCCESS,
        data: { message: "Category created successfully." },
    });
});

const deletCategory = asyncWrapper(async (req, res, next) => {
    const { categoryId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    const category = await categoryModel.findById(categoryId).session(session);
    if (!category) {
        await session.abortTransaction();
        session.endSession();
        return next(
            AppError.create("Categorie Not Found", 404, httpStatusText.FAIL)
        );
    }

    await ProductModel.deleteMany(
        {
            category: categoryId,
        },
        { session }
    );

    await categoryModel.findByIdAndDelete(categoryId).session(session);
    await session.commitTransaction();
    session.endSession();

    return res.json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

module.exports = {
    getCategories,
    addCategory,
    deletCategory,
};
