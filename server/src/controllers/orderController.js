const Order = require("../models/Order");
const Cart = require("../models/Cart");

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

exports.createOrder = async (req, res) => {
  try {

    const {
      shippingAddress,
      paymentMethod
    } = req.body;

    const cart =
      await Cart.findOne({
        user: req.user.id
      }).populate("items.product");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    const totalAmount =
      cart.items.reduce(
        (acc, item) =>
          acc +
          item.product.price *
          item.quantity,
        0
      );

    const order =
      await Order.create({

        user: req.user.id,

        items: cart.items.map(
          item => ({
            product: item.product._id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.product.price
          })
        ),

        shippingAddress,

        paymentMethod,

        totalAmount
      });

    cart.items = [];

    await cart.save();

    res.status(201).json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| My Orders
|--------------------------------------------------------------------------
*/

exports.myOrders = async (req, res) => {
  try {

    const orders =
      await Order.find({
        user: req.user.id
      })
      .sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| Admin - Get All Orders
|--------------------------------------------------------------------------
*/

exports.getAllOrders = async (req, res) => {
  try {

    const orders =
      await Order.find()
      .populate("user")
      .sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| Admin - Update Order Status
|--------------------------------------------------------------------------
*/

exports.updateStatus = async (req, res) => {
  try {

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.orderStatus =
      req.body.status;

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};