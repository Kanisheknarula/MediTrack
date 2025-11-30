// backend/models/AMU.js
const mongoose = require("mongoose");

const DailyTrendSchema = new mongoose.Schema({
  dates: [String],
  quantities: [Number],
}, { _id: false });

const MonthlySummarySchema = new mongoose.Schema({
  monthly_mean: Number,
  monthly_std: Number,
  total_prescriptions: Number
}, { _id: false });

const AMUSchema = new mongoose.Schema({
  area: { type: String, required: true, unique: true }, // e.g. 'indore'
  city_name: { type: String }, // readable name if needed
  total_prescriptions: { type: Number, default: 0 },
  daily_trend: DailyTrendSchema,
  mean_quantity: Number,
  std_quantity: Number,
  anomalies: [{ date: String, quantity: Number, reason: String }],
  monthly_summary: MonthlySummarySchema,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AMU", AMUSchema);
