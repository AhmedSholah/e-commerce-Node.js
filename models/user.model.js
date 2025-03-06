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
        minlength: [6, "Password must be at least 5 characters long"],
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
    cart: {
        type: Array,
        default: [],
    },
    wishlist: {
        type: Array,
        default: [],
    },
    wallet: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("User", userSchema);
