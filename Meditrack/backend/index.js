const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------
// 1. Global Middleware
// -----------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve upload folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------------
// 2. Request Logger (CRITICAL FOR DEBUGGING)
// -----------------------------------
// This will print every request to the console.
// If you don't see a log here when you click a button, the frontend isn't reaching the backend.
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.originalUrl}`);
  next();
});

// -----------------------------------
// 3. CORS Configuration
// -----------------------------------
const allowedOrigins = [
  "http://localhost:5173",              // Localhost Frontend
  "http://localhost:3000",              // Alternative Localhost
  "https://meditrack-hazel.vercel.app", // YOUR LIVE APP
  "https://meditrack-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      // OPTIONAL: Allow all Vercel preview deployments (good for testing)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);
      return callback(new Error('CORS Policy: Origin not allowed'), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

// -----------------------------------
// 4. ROUTES
// -----------------------------------
// Make sure all these files exist in your 'backend/routes' folder!

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

// ✅ FIXED: This is crucial for the Farmer Dashboard
app.use("/api/animals", require("./routes/animals")); 

app.use("/api/requests", require("./routes/request"));
app.use("/api/prescription", require("./routes/prescription"));
app.use("/api/pharmacist", require("./routes/pharmacist"));
app.use("/api/manager", require("./routes/manager"));
app.use("/api/registrar", require("./routes/registrar"));

// ✅ FIXED: These are crucial for the Public Dashboard Graphs
app.use("/api/amu", require("./routes/amuRoutes")); 
app.use("/api/ml", require("./routes/ml"));         

// -----------------------------------
// 5. Blockchain Init (Safe Mode)
// -----------------------------------
try {
  // Only init blockchain if the file exists and env vars are set
  const { initBlockchain } = require("./blockchain/blockchainService");
  initBlockchain();
  console.log("🔗 Blockchain Service Initialized");
} catch (err) {
  console.warn("⚠️ Blockchain init skipped/failed:", err.message);
}

// -----------------------------------
// 6. MongoDB Connection
// -----------------------------------
const mongoUrl = process.env.DATABASE_URL;

if (!mongoUrl) {
  console.error("❌ CRITICAL: DATABASE_URL is missing in .env file");
} else {
  mongoose
    .connect(mongoUrl)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err.message));
}

// -----------------------------------
// 7. Test Route
// -----------------------------------
app.get("/", (req, res) => {
  res.send("MediTrack API is Running! 🚀");
});

// -----------------------------------
// 8. Global Error Handler
// -----------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// -----------------------------------
// Start Server
// -----------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});