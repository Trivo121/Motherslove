const express =
require("express");

const router =
express.Router();

const protect =
require("../middleware/authMiddleware");

const adminOnly =
require("../middleware/adminMiddleware");



const {
 createCoupon,
 getCoupons,
 deleteCoupon
}
=
require("../controllers/couponController");

router.get(
 "/",
 protect,
 adminOnly,
 getCoupons
);

router.post(
 "/",
 protect,
 adminOnly,
 createCoupon
);

router.delete(
 "/:id",
 protect,
 adminOnly,
 deleteCoupon
);

module.exports = router;