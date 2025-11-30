const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------
// Middleware
// -----------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------
// Serve upload folder
// -----------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------------
// CORS Configuration
// -----------------------------------
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin);
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        console.log("❌ CORS BLOCKED:", origin);
        return callback(new Error("CORS Not Allowed"), false);
      }
      console.log("✅ CORS ALLOWED:", origin);
      return callback(null, true);
    },
    credentials: true,
  })
);

// -----------------------------------
// ROUTES
// -----------------------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/requests", require("./routes/request"));
app.use("/api/prescription", require("./routes/prescription"));
app.use("/api/pharmacist", require("./routes/pharmacist"));
app.use("/api/manager", require("./routes/manager"));
app.use("/api/register", require("./routes/registrar"));
app.use("/api/amu", require("./routes/amuRoutes"));
app.use("/api/ml", require("./routes/ml"));

// -----------------------------------
// Blockchain Init
// -----------------------------------
try {
 const { initBlockchain } = require("./blockchain/blockchainService");
  initBlockchain();
} catch (err) {
  console.warn("⚠ Blockchain init failed:", err.message || err);
}

// -----------------------------------
// MongoDB Connection
// -----------------------------------
const mongoUrl = process.env.DATABASE_URL;

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// -----------------------------------
// Test Route
// -----------------------------------
app.get("/", (req, res) => {
  res.send("MediTrack backend is running successfully 🚀");
});

// -----------------------------------
// Global Error Handler
// -----------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.message || err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// -----------------------------------
// Start Server
// -----------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
