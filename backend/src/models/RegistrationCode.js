const mongoose = require('mongoose');

const registrationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      // Format: 2 letters + 2 numbers (e.g., AB12)
      match: [/^[A-Z]{2}\d{2}$/, 'Code must be 2 letters + 2 numbers (e.g., AB12)'],
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RegistrationCode', registrationCodeSchema);
