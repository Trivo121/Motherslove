const express =
require("express");

const router =
express.Router();

const protect =
require("../middleware/authMiddleware");



const {
 toggleWishlist
}
=
require("../controllers/wishlistController");

router.post(
"/:productId",
protect,
toggleWishlist
);

module.exports = router;