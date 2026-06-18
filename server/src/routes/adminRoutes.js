const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const adminOnly = require("../middleware/adminMiddleware");

const upload = require("../middleware/uploadMiddleware");

console.log("Admin Routes Loaded");



// Controllers

const {dashboardStats} = require("../controllers/adminController");

const {
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const {
  getAllOrders,
  updateStatus
} = require("../controllers/orderController");

const {
  createCoupon,
  getCoupons,
  deleteCoupon
} = require("../controllers/couponController");

// Protect all admin routes

router.use(
  protect,
  adminOnly
);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get("/dashboard",dashboardStats);

/*
|--------------------------------------------------------------------------
| Product Management
|--------------------------------------------------------------------------
*/

router.post("/products",upload.array("images",10),createProduct);
console.log("createProduct", typeof createProduct);

router.put("/products/:id",updateProduct);
console.log("updateProduct", typeof updateProduct);

router.delete("/products/:id",deleteProduct);
console.log("deleteProduct", typeof deleteProduct);

/*
|--------------------------------------------------------------------------
| Orders
|--------------------------------------------------------------------------
*/

router.get("/orders",getAllOrders);
console.log("getAllOrders", typeof getAllOrders);

router.put("/orders/:id/status",updateStatus);
console.log("updateStatus", typeof updateStatus);

/*
|--------------------------------------------------------------------------
| Coupons
|--------------------------------------------------------------------------
*/

router.get("/coupons",getCoupons);
console.log("getCoupons", typeof getCoupons);

router.post("/coupons",createCoupon);
console.log("createCoupon", typeof createCoupon);

router.delete( "/coupons/:id",deleteCoupon);
console.log("deleteCoupon", typeof deleteCoupon);

module.exports = router;