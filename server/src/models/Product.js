const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  rating:{
    type:Number,
    min:1,
    max:5
  },

  comment:String
},
{timestamps:true}
);

const productSchema = new mongoose.Schema(
{
  name:{
    type:String,
    required:true
  },

  slug:{
    type:String,
    unique:true
  },

  description:{
    type:String,
    required:true
  },

  category:{
    type:String,
    required:true
  },

  price:{
    type:Number,
    required:true
  },

  images:[String],

  colors:[String],

  sizes:[String],

  stock:{
    type:Number,
    default:0
  },

  featured:{
    type:Boolean,
    default:false
  },

  averageRating:{
    type:Number,
    default:0
  },

  reviews:[reviewSchema]
},
{timestamps:true}
);

module.exports = mongoose.model(
  "Product",
  productSchema
);