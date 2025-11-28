// backend/index.js
// Full server entry (Express) — updated to serve uploads and include a small error handler.
// Based on your previous index.js (keeps same routes & blockchain init). :contentReference[oaicite:1]{index=1}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// Middleware: body parsing
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Serve uploaded files
// -----------------------------
// Make sure "backend/uploads" exists (you already created it).
// Now uploaded photos will be served at: http://yourserver/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------------
// CORS config
// -----------------------------
const allowedOrigins = [
  'http://localhost:5173',   // local frontend dev
  // add your production origin(s) here, e.g.:
  // 'https://amumrlmonitoringplatform.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('--- REQUEST ORIGIN:', origin);
    // allow non-browser tools (curl, postman) which send no origin
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

// -----------------------------
// Routes (keep same structure as your app)
// -----------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/animals', require('./routes/animal'));
app.use('/api/requests', require('./routes/request'));
app.use('/api/prescription', require('./routes/prescription'));
app.use('/api/pharmacist', require('./routes/pharmacist'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/registrar', require('./routes/registrar'));
app.use('/api/amu', require('./routes/amuRoutes'));

// -----------------------------
// Blockchain initialization
// -----------------------------
try {
  const { initBlockchain } = require('./blockchain/blockchainService');
  initBlockchain();
} catch (err) {
  console.warn('Blockchain init failed or module missing:', err.message || err);
}

// -----------------------------
// MongoDB connection
// -----------------------------
const mongoUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
if (!mongoUrl) {
  console.error('❌ DATABASE_URL / MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// -----------------------------
// Root route (quick sanity)
// -----------------------------
app.get('/', (req, res) => {
  res.send("Hello! The MediTrack backend is running.");
});

// -----------------------------
// Basic error handler (JSON)
// -----------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.message ? err.message : err);
  // Multer file-size / type errors may come here - return readable message
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
});

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
