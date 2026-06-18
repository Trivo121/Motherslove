const Coupon =
require("../models/Coupon");

exports.createCoupon =
async(req,res)=>{

  const coupon =
  await Coupon.create(
    req.body
  );

  res.status(201)
  .json(coupon);
};

exports.getCoupons =
async(req,res)=>{

  const coupons =
  await Coupon.find();

  res.json(coupons);
};

exports.deleteCoupon =
async(req,res)=>{

  await Coupon.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message:"Coupon Deleted"
  });
};