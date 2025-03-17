const mongoose = require("mongoose");
const asyncWrapper = require("../middlewares/asyncWrapper");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const bcryptjs = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");
const CartModel = require("../models/cart.model");
const FavoriteModel = require("../models/favorite.model");

const register = asyncWrapper(async function (req, res, next) {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    const { firstName, lastName, email, password, image, gender, role } =
        req.body;

    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
        // await session.abortTransaction();
        // session.endSession();
        return next(
            AppError.create("User Already Exists", 409, httpStatusText.FAIL)
        );
    }

    await UserModel.validate(req.body);

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = await UserModel.create(
        {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            image: "",
            gender,
            role,
        }

        // { session }
    );

    await CartModel.create(
        { user: newUser._id }
        // { session }
    );
    await FavoriteModel.create(
        { userId: newUser._id }
        // { session }
    );

    // await session.commitTransaction();
    // session.endSession();

    const tokenPayload = {
        userId: newUser._id,
        role,
    };

    const token = await generateJWT(tokenPayload);

    res.status(201).json({ status: httpStatusText.SUCCESS, data: { token } });
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const foundUser = await UserModel.findOne({ email });

    if (!foundUser) {
        return next(
            AppError.create("User Not Found", 404, httpStatusText.FAIL)
        );
    }

    const isCorretPassword = await bcryptjs.compare(
        password,
        foundUser.password
    );
    if (!isCorretPassword) {
        return next(
            AppError.create("Invalid Credentials", 501, httpStatusText.FAIL)
        );
    }

    const tokenPayload = {
        userId: foundUser._id,
        role: foundUser.role,
    };

    const token = await generateJWT(tokenPayload);

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { token } });
});

module.exports = { register, login };
