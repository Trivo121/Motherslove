const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const morgan = require("morgan");
const paymentRoutes = require("./routes/paymentRoutes");



const authRoutes = require("./routes/authRoutes");

const app = express();

app.get("/test", (req, res) => {
  res.json({
    message: "API Working"
  });
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
module.exports = app;