const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, "name must be at least 3 characters long"],
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    image: {
        type: String,
        // required: true,
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    description: {
        type: String,
        required: true,
        minlength: [100, "Description must be at least 100 characters long."],
        maxLength: [5000, "Description cannot exceed 5000 characters."],
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    modifiedAt: {
        type: Date,
        default: Date.now,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
    dimensions: {
        type: {
            length: { type: Number, min: 0, required: true },
            width: { type: Number, min: 0, required: true },
            height: { type: Number, min: 0, required: true },
        },
    },
    shippingInfo: {
        type: {
            shippingCost: { type: Number, min: 0, required: true },
            estimatedDelivery: { type: Number, min: 0, required: true },
        },
    },
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("Product", productSchema);
