const mongoose = require('mongoose');

const amuLogSchema = new mongoose.Schema({
    // The Pharmacist who generated the bill
    pharmacist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The original treatment ticket
    treatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatment',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    animal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal',
        required: true
    },
    // CRITICAL FOR ADMIN ANALYTICS: Hardcoding the city here makes graphing lightning fast later
    city: {
        type: String,
        required: true,
        index: true // Speeds up search queries by city
    },
    // The actual medicines dispensed and their cost
    dispensedMedicines: [{
        medicineName: { type: String, required: true },
        quantityOrMg: { type: String, required: true }, // e.g., "500mg" or "2 bottles"
        price: { type: Number, required: true }
    }],
    totalBillAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AMULog', amuLogSchema);