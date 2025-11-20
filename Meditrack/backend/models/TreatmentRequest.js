const mongoose = require('mongoose');

const treatmentRequestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User (Farmer)
    required: true,
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal', // Links to the specific Animal
    required: true,
  },
  problemDescription: {
    type: String,
    required: true, // The text description of the problem
  },
  mediaUrl: {
    type: String, // We'll store a link to the photo/video here
    default: null,
  },
  status: {
    type: String,
    // This is the "kanban" board for the request
    enum: ['Pending', 'Accepted', 'Declined', 'Completed'],
    default: 'Pending',
  },
  // We will add 'vetId' and 'prescriptionId' here later
  // when the vet accepts the request.
// ... inside the schema, after 'status'
vetId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null // Will be null until a vet accepts
},
prescriptionId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Prescription',
  default: null // Will be null until prescribed
},
declineReason: {
  type: String,
  default: null // A vet will fill this if they decline
}


}, { timestamps: true });

module.exports = mongoose.model('TreatmentRequest', treatmentRequestSchema);