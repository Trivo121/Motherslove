const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

  code:{
    type:String,
    unique:true,
    required:true
  },

  discountType:{
    type:String,
    enum:["PERCENTAGE","FIXED"],
    default:"PERCENTAGE"
  },

  discountValue:{
    type:Number,
    required:true
  },

  minimumPurchase:{
    type:Number,
    default:0
  },

  maxDiscount:{
    type:Number,
    default:0
  },

  expiryDate:{
    type:Date,
    required:true
  },

  active:{
    type:Boolean,
    default:true
  }

},{
  timestamps:true
});

module.exports =
mongoose.model("Coupon",couponSchema);