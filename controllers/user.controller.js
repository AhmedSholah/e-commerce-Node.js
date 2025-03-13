const asyncWrapper = require("../middlewares/asyncWrapper");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

const getAllUsers = asyncWrapper(async (req, res, next) => {
    const users = await UserModel.find({}, { __v: false, password: false });
    if (!users) {
        return next(
            AppError.create("No Users Found", 404, httpStatusText.FAIL)
        );
    }
    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { users } });
});

// For Admin Use
const getUser = asyncWrapper(async (req, res, next) => {
    const id = req.params.id;
    const user = await UserModel.findOne(
        { _id: id },
        { __v: false, password: false }
    );
    if (!user) {
        return next(
            AppError.create("User Not Found", 404, httpStatusText.FAIL)
        );
    }
    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { user } });
});

// For Current User Use
const getCurrentUser = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const currentUser = await UserModel.findById(userId, {
        __v: false,
        password: false,
    });
    if (!currentUser) {
        return next(
            AppError.create("User Not Found", 404, httpStatusText.FAIL)
        );
    }
    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { currentUser } });
});

const updateUser = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const user = await UserModel.findById(userId, {
        __v: false,
        password: false,
    });
    if (!user) {
        return next(
            AppError.create("User Not Found", 404, httpStatusText.FAIL)
        );
    }
    let { userUpdated } = req.body;
    await userUpdated.save();

    const updateUser = await UserModel.findById(userId, {
        __v: false,
        password: false,
    });

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: updateUser });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const user = await UserModel.findById(userId, {
        __v: false,
        password: false,
    });
    if (!user) {
        return next(
            AppError.create("User Not Found", 404, httpStatusText.FAIL)
        );
    }

    await user.remove();
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getCurrentUser,
};
