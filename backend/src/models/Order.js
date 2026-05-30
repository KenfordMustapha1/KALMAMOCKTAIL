const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  drink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drink',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Ready', 'Completed'],
      default: 'Pending',
    },
    orderType: {
      type: String,
      enum: ['standard', 'qr_preorder'],
      default: 'standard',
    },
    sourceToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
