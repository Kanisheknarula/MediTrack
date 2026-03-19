const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
    // Links this animal to a specific Farmer
    farmer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // The unique ID (e.g., ANI-2026-0001)
    animalId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    animalType: { 
        type: String, 
        required: [true, 'Please specify animal type (e.g., Cow, Buffalo)'] 
    },
    breed: { 
        type: String, 
        required: true 
    },
    age: { 
        type: Number, 
        required: [true, 'Age in months is required'] 
    },
    weight: { 
        type: Number, 
        required: [true, 'Weight in kg is required'] 
    },
    group: { 
        type: String // Optional: For farmers with large herds/groups
    },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Deceased'], 
        default: 'Active' 
    },
    // Records which Registrar actually did the data entry
    registeredBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // We will use this later for your "6-Month Heartbeat" feature
    lastRenewedDate: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Animal', animalSchema);