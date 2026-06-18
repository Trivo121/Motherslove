const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const adminOnly =
require("../middleware/adminMiddleware");

const upload =
require("../middleware/uploadMiddleware");

const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct
} =
require("../controllers/productController");

// Debug Logs (Temporary)

console.log("getProducts", typeof getProducts);
console.log("getSingleProduct", typeof getSingleProduct);
console.log("createProduct", typeof createProduct);
console.log("updateProduct", typeof updateProduct);
console.log("deleteProduct", typeof deleteProduct);
console.log("upload", typeof upload);
console.log(
  "upload.array",
  typeof upload?.array
);

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getProducts
);

router.get(
  "/:id",
  getSingleProduct
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 10),
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

module.exports = router;