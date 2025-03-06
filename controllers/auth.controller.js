const asyncWrapper = require("../middlewares/asyncWrapper");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const bcyrptjs = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");

const register = asyncWrapper(async function (req, res, next) {
    const { username, email, password, image, gender, role } = req.body;

    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
        return next(
            AppError.create("User Already Exists", 409, httpStatusText.FAIL)
        );
    }

    const hashedPassword = await bcyrptjs.hash(password, 12);

    const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        image: "",
        gender,
        role,
    });

    console.log(newUser);

    const tokenPayload = {
        id: newUser._id,
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

    const isCorretPassword = await bcyrptjs.compare(
        password,
        foundUser.password
    );
    if (!isCorretPassword) {
        return next(
            AppError.create("Invalid Credentials", 501, httpStatusText.FAIL)
        );
    }

    const tokenPayload = {
        id: foundUser._id,
        role: foundUser.role,
    };

    const token = await generateJWT(tokenPayload);

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { token } });
});

module.exports = { register, login };
