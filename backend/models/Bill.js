const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    bill: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Normal", "High"],
      default: "Normal",
    },
    consumerNumber: {
      type: String,
      default: "PP-88213",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);