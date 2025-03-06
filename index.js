const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const connectToDB = require("./database/database");
const httpStatusText = require("./utils/httpStatusText");

// routes
const authRouter = require("./routes/authRouter");
const categoriesRouter = require("./routes/categoriesRouter");

// middlewares

app.use("/api/auth", authRouter);

app.use("/api/categories", categoriesRouter);

app.use("*", (req, res, next) => {
    res.status(404).json({
        status: httpStatusText.ERROR,
        message: "Not Found.",
        data: null,
    });
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.statusText || httpStatusText.ERROR,
        message: err.message,
        data: null,
    });
});

connectToDB();
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
