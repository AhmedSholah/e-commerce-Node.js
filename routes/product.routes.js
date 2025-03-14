const router = require("express").Router();
const productsController = require("../controllers/product.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const {
    addProductSchema,
    updateProductSchema,
    getProductsSchema,
    deleteProductSchema,
} = require("../utils/validation/productValidation");

router
    .route("/")
    .get(
        validateSchema(getProductsSchema, "query"),
        productsController.getProducts
    )
    .post(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(addProductSchema),
        productsController.addOneProduct
    );

router
    .route("/:productId")
    .get(productsController.getOneProduct)
    .patch(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(updateProductSchema),
        productsController.updateOneProduct
    )
    .delete(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(deleteProductSchema, "params"),
        productsController.deleteOneProduct
    );

module.exports = router;
