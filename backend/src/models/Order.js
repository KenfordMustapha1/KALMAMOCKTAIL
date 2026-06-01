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
    },
    walkInName: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
      enum: ['standard', 'qr_preorder', 'admin_manual', 'walk_in'],
      default: 'standard',
    },
    sourceToken: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (!this.user && !this.walkInName) {
    next(new Error('Order must have a customer account or walk-in name'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', orderSchema);
