// ===============================
//  IMPORTS
// ===============================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  // Load .env variables

// ===============================
//  EXPRESS SETUP
// ===============================
const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
//  MIDDLEWARE
// ===============================
app.use(express.json());  // Parse JSON bodies

// CORS allowed origins
const allowedOrigins = [
  'http://localhost:5173',   // Frontend (local)
  // 'https://amumrlmoniteringplatform.netlify.app' // Production (optional)
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('--- REQUEST ORIGIN:', origin);

    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      console.log('❌ CORS BLOCKED:', origin);
      return callback(new Error("CORS Not Allowed"), false);
    }

    console.log('✅ CORS ALLOWED:', origin);
    return callback(null, true);
  },
  credentials: true,
}));

// ===============================
//  ROUTES IMPORTS
// ===============================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/animals', require('./routes/animal'));
app.use('/api/requests', require('./routes/request'));

// ⭐ FIXED — Use singular everywhere
app.use('/api/prescription', require('./routes/prescription'));

app.use('/api/pharmacist', require('./routes/pharmacist'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/registrar', require('./routes/registrar'));

// ⭐ NEW — AMU ROUTES
app.use('/api/amu', require('./routes/amuRoutes'));

// ===============================
//  BLOCKCHAIN INITIALIZATION
// ===============================
const { initBlockchain } = require('./blockchain/blockchainService');
initBlockchain();   // This prints "Blockchain Connected Successfully"

// ===============================
//  MONGODB CONNECTION
// ===============================
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// ===============================
//  ROOT TEST ROUTE
// ===============================
app.get('/', (req, res) => {
  res.send("Hello! The MediTrack backend is running.");
});

// ===============================
//  START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
