const Cart = require("../models/Cart");

exports.getCart = async(req,res)=>{

  let cart =
  await Cart.findOne({
    user:req.user.id
  }).populate("items.product");

  if(!cart){

    cart =
    await Cart.create({
      user:req.user.id,
      items:[]
    });

  }

  res.json(cart);
};

exports.addToCart =
async(req,res)=>{

  const {
    productId,
    quantity,
    size,
    color
  } = req.body;

  let cart =
  await Cart.findOne({
    user:req.user.id
  });

  if(!cart){

    cart =
    await Cart.create({
      user:req.user.id,
      items:[]
    });

  }

  cart.items.push({
    product:productId,
    quantity,
    size,
    color
  });

  await cart.save();

  res.json(cart);
};

exports.removeFromCart =
async(req,res)=>{

  const cart =
  await Cart.findOne({
    user:req.user.id
  });

  cart.items =
  cart.items.filter(
    item =>
    item._id.toString() !==
    req.params.itemId
  );

  await cart.save();

  res.json(cart);
};