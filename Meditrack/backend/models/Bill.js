// backend/models/Bill.js

const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    // Which prescription this bill is for
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },

    // Which pharmacist generated this bill
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic display fields (adjust names as you like)
    farmerName: { type: String },
    animalTagId: { type: String },

    // Line items in the bill (optional structure)
    items: [
      {
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],

    // Total billed amount
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      default: "Paid",
    },
  },
  {
    timestamps: true, // creates createdAt, updatedAt
  }
);

module.exports = mongoose.model("Bill", billSchema);
