const mongoose = require("mongoose");
const asyncWrapper = require("../middlewares/asyncWrapper");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const bcryptjs = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");
const CartModel = require("../models/cart.model");
const FavoriteModel = require("../models/favorite.model");

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

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

const google = asyncWrapper(async (req, res, next) => {
    const authUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
    });
    res.redirect(authUrl);
});

const googleCallback = asyncWrapper(async (req, res, next) => {
    const { code } = req.query;

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const userInfo = await client.request({
            url: "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
        });

        const userData = userInfo.data;
        const email = userData.emailAddresses[0].value;
        const name = userData.names[0].displayName;
        const picture = userData.photos[0].url;

        const foundUser = await UserModel.findOne({ email });

        let token;
        if (foundUser) {
            const tokenPayload = {
                userId: foundUser._id,
                role: foundUser.role,
            };

            token = await generateJWT(tokenPayload);
        } else {
            const newUser = await UserModel.create({
                firstName: name.split(" ")[0],
                lastName: name.split(" ")[1],
                email,
                provider: "google",
                avatar: picture,
                role: "client",
            });

            const tokenPayload = {
                id: newUser._id,
                role: newUser.role,
            };
            token = await generateJWT(tokenPayload);
        }

        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (error) {
        console.error("Authentication failed:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
});

module.exports = {
    register,
    login,
    google,
    googleCallback,
};
