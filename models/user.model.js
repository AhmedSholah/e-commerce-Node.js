const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters long"],
        maxlength: [256, "Password must be at most 256 characters long"],
        validate: {
            validator: function (value) {
                return (
                    /[A-Z]/.test(value) &&
                    /[a-z]/.test(value) &&
                    /[0-9]/.test(value) &&
                    /[!@#$%^&*(),.?":{}|<>]/.test(value) &&
                    !/\s/.test(value)
                );
            },
            message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must not contain spaces.",
        },
    },
    image: {
        type: String,
        // required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
    },
    role: {
        type: String,
        enum: ["client", "seller", "admin"],
        default: "client",
    },
    wallet: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("User", userSchema);
