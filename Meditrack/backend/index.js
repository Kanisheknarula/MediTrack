// Import the packages we installed
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// This line loads the .env file variables (like your DATABASE_URL)
require('dotenv').config();

// --- 1. Create the Express App ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. Add "Middleware" ---

// This is your "guest list"
const allowedOrigins = [
 // 'https://amumrlmoniteringplatform.netlify.app', // Your live Netlify site
  'http://localhost:5173'  // Your local dev site
];

// Allows the server to understand JSON data
app.use(express.json()); 

// --- THIS IS THE FINAL CORS CONFIGURATION ---
app.use(cors({
  origin: function (origin, callback) {
    
    // --- THIS IS THE NEW DEBUGGING LINE ---
    console.log('--- REQUEST ORIGIN: ---', origin);

    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('--- ACCESS GRANTED (No Origin) ---');
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('--- ACCESS DENIED ---');
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }

    console.log('--- ACCESS GRANTED ---');
    return callback(null, true);
  },
  credentials: true
}));
// --- END OF CORS CONFIGURATION ---


// --- Connect the Auth Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const animalRoutes = require('./routes/animal');
app.use('/api/animals', animalRoutes);

const requestRoutes = require('./routes/request');
app.use('/api/requests', requestRoutes);

const prescriptionRoutes = require('./routes/prescription');
app.use('/api/prescriptions', prescriptionRoutes);

const pharmacistRoutes = require('./routes/pharmacist');
app.use('/api/pharmacist', pharmacistRoutes);

const managerRoutes = require('./routes/manager');
app.use('/api/manager', managerRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const mlRoutes = require('./routes/ml');
app.use('/api/ml', mlRoutes);




// --- ADD THESE NEW LINES ---
const registrarRoutes = require('./routes/registrar');
app.use('/api/registrar', registrarRoutes);
// ---------------------------



// ... MongoDB Connection ...
mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('✅ MongoDB Connected!');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
  });

// ... Test Route ...
app.get('/', (req, res) => {
  res.send('Hello! The MediTrack server is running.');
});

// ... Start the Server ...
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});