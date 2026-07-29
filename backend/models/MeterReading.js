const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  appliance: String,
  voltage: Number,
  current: Number,
  power: Number,
  fault: Boolean,
});

const meterReadingSchema = new mongoose.Schema({
  timestamp: Number,
  readings: [readingSchema],
  receivedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MeterReading", meterReadingSchema);
