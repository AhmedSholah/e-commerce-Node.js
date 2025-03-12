const router = require("express").Router();
const favoriteController = require("../controllers/favorite.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");

router
    .route("/")
    .get(isAuthenticated, favoriteController.getFavorite)
    .post(isAuthenticated, favoriteController.addToFavoriteItem)
    .delete(isAuthenticated, favoriteController.deleteFavoriteItem);

module.exports = router;
