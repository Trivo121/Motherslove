const Razorpay = require("razorpay");

if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_SECRET
) {
  console.warn("Razorpay credentials not configured");
  module.exports = null;
} else {
  module.exports = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
}