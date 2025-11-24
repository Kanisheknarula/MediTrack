const mongoose = require("mongoose");

const amuSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
  },
  animalId: {
    type: String,
    required: true,
  },
  recordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("AMUModel", amuSchema);
