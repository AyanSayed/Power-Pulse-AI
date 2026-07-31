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

// GET /api/meter-reading -> fetch recent readings (latest first)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recent = await MeterReading.find().sort({ receivedAt: -1 }).limit(limit);
    res.json(recent);
  } catch (err) {
    console.error("Meter reading fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});
// GET /api/meter-reading/run-rate -> monthly consumption velocity + projection
router.get("/run-rate", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const monthReadings = await MeterReading.find({
      receivedAt: { $gte: startOfMonth, $lte: now },
    }).sort({ receivedAt: 1 });

    let unitsSoFar = 0; // kWh

    for (let i = 1; i < monthReadings.length; i++) {
      const prev = monthReadings[i - 1];
      const curr = monthReadings[i];

      const prevWatts = prev.readings.reduce((sum, r) => sum + (r.power || 0), 0);
      const currWatts = curr.readings.reduce((sum, r) => sum + (r.power || 0), 0);

      const dtHours = (curr.receivedAt - prev.receivedAt) / (1000 * 60 * 60);
      if (dtHours <= 0 || dtHours > 1) continue; // skip bad gaps (e.g. server downtime)

      const avgWatts = (prevWatts + currWatts) / 2;
      unitsSoFar += (avgWatts * dtHours) / 1000; // Wh -> kWh
    }

    const daysElapsed = Math.max((now - startOfMonth) / (1000 * 60 * 60 * 24), 0.5);
    const velocity = unitsSoFar / daysElapsed;
    const projected = velocity * daysInMonth;

    const SLAB_LIMIT = 300;
    let zone = "green";
    if (projected > SLAB_LIMIT) zone = "red";
    else if (projected >= SLAB_LIMIT * 0.9) zone = "yellow";

    res.json({
      unitsSoFar: Math.round(unitsSoFar * 100) / 100,
      daysElapsed: Math.round(daysElapsed * 10) / 10,
      daysInMonth,
      velocity: Math.round(velocity * 100) / 100,
      projected: Math.round(projected * 100) / 100,
      slabLimit: SLAB_LIMIT,
      zone,
    });
  } catch (err) {
    console.error("Run-rate error:", err.message);
    res.status(500).json({ error: "Failed to calculate run rate" });
  }
});
module.exports = router;
