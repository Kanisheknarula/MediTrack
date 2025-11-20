const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true,
  },
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // We'll just copy the items from the prescription for the bill
  items: [
    {
      name: String,
      dosage: String,
      price: Number, // The pharmacist adds the price
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);