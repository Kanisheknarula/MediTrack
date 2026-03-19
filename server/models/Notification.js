const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Who receives this notification (Farmer, Vet, etc.)
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Renewal', 'TreatmentUpdate', 'SystemAlert'],
        required: true
    },
    // Is it related to a specific animal? (Optional, but good for renewals)
    relatedAnimal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);