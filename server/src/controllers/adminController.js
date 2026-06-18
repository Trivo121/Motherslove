const User =
require("../models/User");

const Product =
require("../models/Product");

const Order =
require("../models/Order");

exports.dashboardStats =
async(req,res)=>{

  const totalUsers =
  await User.countDocuments();

  const totalProducts =
  await Product.countDocuments();

  const totalOrders =
  await Order.countDocuments();

  const revenueData =
  await Order.find({
    paymentStatus:"PAID"
  });

  const revenue =
  revenueData.reduce(
    (acc,item)=>
    acc + item.totalAmount,
    0
  );

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    revenue
  });
};

