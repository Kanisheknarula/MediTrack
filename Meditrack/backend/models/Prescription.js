const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }
});

const prescriptionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentRequest',
      required: true,
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },

    location: { type: String, trim: true },

    medicines: [medicineSchema],

    withdrawalPeriodDays: {
      type: Number,
      required: true,
    },

    notes: { type: String },

    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
