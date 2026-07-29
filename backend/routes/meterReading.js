const express = require("express");
const router = express.Router();
const MeterReading = require("../models/MeterReading");

// POST /api/meter-reading -> receives live ESP32 sensor data
router.post("/", async (req, res) => {
  try {
    const { timestamp, readings } = req.body;

    if (!readings || !Array.isArray(readings)) {
      return res.status(400).json({ error: "Invalid payload: readings array required" });
    }

    const newReading = new MeterReading({ timestamp, readings });
    await newReading.save();

    res.status(201).json({ message: "Reading saved", id: newReading._id });
  } catch (err) {
    console.error("Meter reading error:", err.message);
    res.status(500).json({ error: "Failed to save reading" });
  }
});

module.exports = router;
