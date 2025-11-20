const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true, // e.g., "10ml, twice a day"
  }
});

const prescriptionSchema = new mongoose.Schema({
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
  location: { // <-- ADD THIS FIELD
  type: String,
  trim: true
},
  medicines: [medicineSchema],
  withdrawalPeriodDays: {
    type: Number,
    required: true, 
  },
  notes: {
    type: String, 
  }, // <-- *** THIS COMMA WAS PROBABLY MISSING ***

  // This is the new field you added
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    default: null 
  }

}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);