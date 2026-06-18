const User = require("../models/User");

exports.toggleWishlist =
async(req,res)=>{

  const user =
  await User.findById(req.user.id);

  const productId =
  req.params.productId;

  const exists =
  user.wishlist.includes(productId);

  if(exists){

    user.wishlist =
    user.wishlist.filter(
      item =>
      item.toString() !== productId
    );

  }else{

    user.wishlist.push(productId);

  }

  await user.save();

  res.json(user.wishlist);
};