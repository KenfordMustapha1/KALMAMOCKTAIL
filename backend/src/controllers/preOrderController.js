const crypto = require('crypto');
const PreOrder = require('../models/PreOrder');
const Order = require('../models/Order');
const Drink = require('../models/Drink');

const PREORDER_TTL_HOURS = 24;

const validateAndBuildOrderItems = async (items) => {
  if (!items || items.length === 0) {
    throw new Error('No order items');
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const drink = await Drink.findById(item.drink);
    if (!drink) {
      throw new Error(`Drink not found: ${item.drink}`);
    }
    if (!drink.availability) {
      throw new Error(`${drink.name} is currently unavailable`);
    }
    orderItems.push({
      drink: drink._id,
      name: drink.name,
      price: drink.price,
      quantity: item.quantity,
    });
    totalPrice += drink.price * item.quantity;
  }

  return { orderItems, totalPrice };
};

const createPreOrder = async (req, res) => {
  try {
    const { items } = req.body;
    await validateAndBuildOrderItems(items);

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + PREORDER_TTL_HOURS * 60 * 60 * 1000);

    const preOrder = await PreOrder.create({
      token,
      user: req.user._id,
      items: items.map((item) => ({
        drink: item.drink,
        quantity: item.quantity,
      })),
      expiresAt,
    });

    const populated = await PreOrder.findById(preOrder._id)
      .populate('user', 'name email')
      .populate('items.drink', 'name price image category availability');

    res.status(201).json(populated);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const getPreOrderByToken = async (req, res) => {
  try {
    const preOrder = await PreOrder.findOne({ token: req.params.token })
      .populate('user', 'name email')
      .populate('items.drink', 'name price image category availability');

    if (!preOrder) {
      return res.status(404).json({ message: 'Pre-order not found or already used' });
    }

    const expired = preOrder.expiresAt < new Date();

    res.json({
      ...preOrder.toObject(),
      expired,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const redeemPreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findOne({ token: req.params.token });

    if (!preOrder) {
      return res.status(404).json({ message: 'Pre-order not found or already used' });
    }

    if (preOrder.expiresAt < new Date()) {
      await PreOrder.findByIdAndDelete(preOrder._id);
      return res.status(400).json({ message: 'This pre-order has expired' });
    }

    const { orderItems, totalPrice } = await validateAndBuildOrderItems(
      preOrder.items.map((item) => ({
        drink: item.drink.toString(),
        quantity: item.quantity,
      }))
    );

    const order = await Order.create({
      user: preOrder.user,
      items: orderItems,
      totalPrice,
      orderType: 'qr_preorder',
      sourceToken: preOrder.token,
    });

    await PreOrder.findByIdAndDelete(preOrder._id);

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.drink', 'name image category');

    res.status(201).json(populatedOrder);
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const getMyPreOrders = async (req, res) => {
  try {
    const preOrders = await PreOrder.find({ user: req.user._id })
      .populate('items.drink', 'name price image category')
      .sort({ createdAt: -1 });
    res.json(preOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPreOrder,
  getPreOrderByToken,
  redeemPreOrder,
  getMyPreOrders,
};
