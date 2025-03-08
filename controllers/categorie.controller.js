const asyncWrapper = require("../middlewares/asyncWrapper");
const categoryModel = require("../models/category.model");
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

module.exports = {
    getCategories,
    addCategory,
};
