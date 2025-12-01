const mongoose = require("mongoose");

// This schema matches the actual data in your MongoDB 'amu' collection
const AMUSchema = new mongoose.Schema({
  area: String,      // e.g., "Indore"
  quantity: Number,  // e.g., 52
  date: String       // e.g., "2025-01-11"
}, { collection: 'amu' }); // ⚠️ CRITICAL: Force it to look at the 'amu' collection, not 'amus'

module.exports = mongoose.model("AMU", AMUSchema);