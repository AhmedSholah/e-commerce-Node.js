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

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    .get(
        validateSchema(getProductsSchema, "query"),
        productsController.getProducts
    )
    .post(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        // validateSchema(addProductSchema),
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
    .put(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(updateProductSchema),
        upload.single("file"),
        productsController.updateProductImage
    )
    .delete(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(deleteProductSchema, "params"),
        productsController.deleteOneProduct
    );

module.exports = router;
