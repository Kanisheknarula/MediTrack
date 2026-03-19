const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true, // No two users can have the same phone number
        match: [/^\d{10}$/, 'Please add a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // When we fetch users, don't return the password by default
    },
    role: {
        type: String,
        enum: ['Farmer', 'Vet', 'Pharmacist', 'Registrar', 'Admin'],
        required: [true, 'Please specify a user role']
    },
    city: {
        type: String,
        required: [true, 'City is required for AMU location tracking']
    },
    address: {
        type: String
    }
}, {
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Future-Proofing: Encrypt password using bcrypt before saving to database
userSchema.pre('save', async function(next) {
    // If the password isn't modified, move on (useful for profile updates later)
    if (!this.isModified('password')) {
        next();
    }

    // Generate a secure salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Create a method to check if an entered password matches the hashed one
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);