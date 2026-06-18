const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },

  quantity:{
    type:Number,
    required:true
  },

  size:String,
  color:String,

  price:{
    type:Number,
    required:true
  }
});

const orderSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  items:[orderItemSchema],

  shippingAddress:{
    fullName:String,
    phone:String,
    address:String,
    city:String,
    state:String,
    pincode:String
  },

  paymentMethod:{
    type:String,
    enum:["COD","RAZORPAY"],
    default:"COD"
  },

  paymentStatus:{
    type:String,
    enum:["PENDING","PAID"],
    default:"PENDING"
  },

  orderStatus:{
    type:String,
    enum:[
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ],
    default:"PLACED"
  },

  totalAmount:Number

},{
  timestamps:true
});

module.exports =
mongoose.model("Order",orderSchema);