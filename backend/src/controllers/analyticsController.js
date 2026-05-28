const Order = require('../models/Order');

const getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'Completed' });

    const totalOrders = await Order.countDocuments();
    const completedOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const revenue = totalSales;

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const preparingOrders = await Order.countDocuments({ status: 'Preparing' });
    const readyOrders = await Order.countDocuments({ status: 'Ready' });

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      completedOrders,
      totalSales,
      revenue,
      pendingOrders,
      preparingOrders,
      readyOrders,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
