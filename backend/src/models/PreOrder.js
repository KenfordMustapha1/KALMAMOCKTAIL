const mongoose = require('mongoose');

const preOrderItemSchema = new mongoose.Schema({
  drink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drink',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const preOrderSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [preOrderItemSchema],
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    redeemedAt: Date,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PreOrder', preOrderSchema);
