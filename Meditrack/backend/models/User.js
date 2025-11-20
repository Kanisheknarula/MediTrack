const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // No two users can have the same phone number
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    // 'enum' means the role can ONLY be one of these four values
    enum: ['Farmer', 'Vet', 'Pharmacist', 'Manager' , 'Admin' , 'Registrar'],
  },
  city: { 
  type: String,
  required: true,
  trim: true 
},
  location: {
    type: {
      type: String,
      enum: ['Point'], // For GeoJSON
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
    },
  }
}, { timestamps: true }); // 'timestamps' adds 'createdAt' and 'updatedAt' fields

// This is a "pre-save hook".
// BEFORE a user is saved to the database, this function will run
userSchema.pre('save', async function (next) {
  // 'this' refers to the user document about to be saved
  
  // Only hash the password if it's new or has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 'bcrypt.genSalt(10)' creates a "salt" (random text) to make the hash secure
    const salt = await bcrypt.genSalt(10);
    // 'bcrypt.hash' mixes the password with the salt to create the final hash
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// This line creates the model and exports it
// MongoDB will automatically name the collection "users" (plural and lowercase)
module.exports = mongoose.model('User', userSchema);