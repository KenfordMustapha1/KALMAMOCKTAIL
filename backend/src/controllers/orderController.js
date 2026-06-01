const Order = require('../models/Order');
const Drink = require('../models/Drink');

const buildOrderItems = async (items) => {
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

const populateOrder = (query) =>
  query.populate('user', 'name email').populate('items.drink', 'name image category');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const { orderItems, totalPrice } = await buildOrderItems(items);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
    });

    const populatedOrder = await populateOrder(Order.findById(order._id));
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const adminCreateOrder = async (req, res) => {
  try {
    const { items, userId, walkInName, status } = req.body;

    if (!userId && !walkInName?.trim()) {
      return res.status(400).json({
        message: 'Select a registered customer or enter a walk-in customer name',
      });
    }

    const { orderItems, totalPrice } = await buildOrderItems(items);

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed'];
    const orderStatus = validStatuses.includes(status) ? status : 'Pending';

    const orderData = {
      items: orderItems,
      totalPrice,
      status: orderStatus,
      orderType: userId ? 'admin_manual' : 'walk_in',
    };

    if (userId) {
      orderData.user = userId;
    } else {
      orderData.walkInName = walkInName.trim();
    }

    const order = await Order.create(orderData);
    const populatedOrder = await populateOrder(Order.findById(order._id));
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.drink', 'name image category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      req.user.role !== 'admin' &&
      (!order.user || order.user._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await populateOrder(Order.find()).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await populateOrder(
      Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrderPayment = async (req, res) => {
  try {
    const { isPaid } = req.body;

    if (typeof isPaid !== 'boolean') {
      return res.status(400).json({ message: 'isPaid must be true or false' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Completed') {
      return res.status(400).json({
        message: 'Payment can only be updated for completed orders',
      });
    }

    order.isPaid = isPaid;
    await order.save();

    const populatedOrder = await populateOrder(Order.findById(order._id));
    res.json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Completed') {
      return res.status(400).json({
        message: 'Only completed orders can be deleted',
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  adminCreateOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
};
