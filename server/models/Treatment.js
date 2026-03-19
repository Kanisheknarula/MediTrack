const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    // The Farmer requesting help
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The Animal that is sick
    animal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal',
        required: true
    },
    // The Vet who accepts the case (Empty at first!)
    vet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Farmer's input
    symptomsDescription: {
        type: String,
        required: [true, 'Please describe the symptoms']
    },
    // We will store cloud URLs for images and voice notes later
    imageUrl: {
        type: String, 
        default: ''
    },
    voiceNoteUrl: {
        type: String,
        default: ''
    },
    // Tracking the progress of the request
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    // The Vet's Prescription (We embed it right into the treatment ticket)
    prescription: [{
        medicineName: String,
        dosage: String,
        withdrawalPeriodDays: Number,
        notes: String
    }],
    // Has the Pharmacist generated a bill yet?
    billGenerated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Treatment', treatmentSchema);