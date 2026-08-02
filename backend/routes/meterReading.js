const express = require("express");
const router = express.Router();
const MeterReading = require("../models/MeterReading");
const { requireAuth } = require("../middleware/authMiddleware");

const DEVICE_KEY = process.env.METER_DEVICE_KEY;
const OWNER_USER_ID = process.env.METER_OWNER_USER_ID;

// POST /api/meter-reading -> receives live ESP32 sensor data.
// Requires a matching device key header — not open to the public.
router.post("/", async (req, res) => {
  try {
    const deviceKey = req.headers["x-device-key"];
    if (!DEVICE_KEY || deviceKey !== DEVICE_KEY) {
      return res.status(401).json({ error: "Invalid device key" });
    }

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

// GET /api/meter-reading -> only the owning user can read live meter data.
// Everyone else gets an empty array back, which naturally keeps them on Tier 1/2.
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!OWNER_USER_ID || req.userId !== OWNER_USER_ID) {
      return res.json([]);
    }

    const limit = parseInt(req.query.limit) || 20;
    const recent = await MeterReading.find().sort({ receivedAt: -1 }).limit(limit);
    res.json(recent);
  } catch (err) {
    console.error("Meter reading fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

// GET /api/meter-reading/run-rate -> same ownership gate
router.get("/run-rate", requireAuth, async (req, res) => {
  try {
    if (!OWNER_USER_ID || req.userId !== OWNER_USER_ID) {
      return res.json({
        unitsSoFar: 0, daysElapsed: 0, daysInMonth: 30,
        velocity: 0, projected: 0, slabLimit: 300, zone: "green",
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const monthReadings = await MeterReading.find({
      receivedAt: { $gte: startOfMonth, $lte: now },
    }).sort({ receivedAt: 1 });

    let unitsSoFar = 0;

    for (let i = 1; i < monthReadings.length; i++) {
      const prev = monthReadings[i - 1];
      const curr = monthReadings[i];

      const prevWatts = prev.readings.reduce((sum, r) => sum + (r.power || 0), 0);
      const currWatts = curr.readings.reduce((sum, r) => sum + (r.power || 0), 0);

      const dtHours = (curr.receivedAt - prev.receivedAt) / (1000 * 60 * 60);
      if (dtHours <= 0 || dtHours > 1) continue;

      const avgWatts = (prevWatts + currWatts) / 2;
      unitsSoFar += (avgWatts * dtHours) / 1000;
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