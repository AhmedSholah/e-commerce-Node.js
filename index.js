const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const connectToDB = require("./database/database");
const httpStatusText = require("./utils/httpStatusText");

// Routes
const authRoutes = require("./routes/auth.routes");
const categoriesRoutes = require("./routes/categorie.routes");
const productsRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const favoriteRoutes = require("./routes/favorite.routes");

// Middleware
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorite", favoriteRoutes);

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
