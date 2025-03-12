const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        minlength: [3, "String must be at least 3 characters long"],
        maxLength: [32, "String must be at least 32 characters long"],
    },
    image: {
        type: String,
    },
});

module.exports = mongoose.model("Category", categorySchema);
