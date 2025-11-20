const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  // This 'ownerId' links the animal to the 'User' who owns it
  ownerId: {
    type: mongoose.Schema.Types.ObjectId, // This is a special type for IDs
    ref: 'User', // It refers to the 'User' model
    required: true,
  },
  animalTagId: {
    type: String,
    required: true, // The farmer's tag for the animal (e.g., "Cow-01")
  },
  type: {
    type: String,
    required: true, // e.g., "Cow", "Chicken", "Goat"
  },
  breed: {
    type: String,
  },
  age: {
    type: Number,
  },
  weight: {
    type: Number, // Optional weight
  },
  groupName: {
    type: String, // For the Farm Manager's grouping feature
  },
  status: {
    type: String,
    default: 'Healthy', // Default status when added
  },
  // This is the CRITICAL MRL (Maximum Residue Limit) field
  withdrawalUntil: {
    type: Date,
    default: null, // 'null' means the animal is safe
  },
}, { timestamps: true }); // Adds 'createdAt' and 'updatedAt'

// This makes sure one farmer can't have two animals with the same tag ID
animalSchema.index({ ownerId: 1, animalTagId: 1 }, { unique: true });

module.exports = mongoose.model('Animal', animalSchema);