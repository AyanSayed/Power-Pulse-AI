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

// GET /api/meter-reading/daily-summary -> today vs yesterday units, same gate as others
router.get("/daily-summary", requireAuth, async (req, res) => {
  try {
    if (!OWNER_USER_ID || req.userId !== OWNER_USER_ID) {
      return res.json({ todayUnits: 0, yesterdayUnits: 0 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    async function unitsBetween(from, to) {
      const docs = await MeterReading.find({
        receivedAt: { $gte: from, $lte: to },
      }).sort({ receivedAt: 1 });

      let units = 0;
      for (let i = 1; i < docs.length; i++) {
        const prevWatts = docs[i - 1].readings.reduce((sum, r) => sum + (r.power || 0), 0);
        const currWatts = docs[i].readings.reduce((sum, r) => sum + (r.power || 0), 0);
        const dtHours = (docs[i].receivedAt - docs[i - 1].receivedAt) / (1000 * 60 * 60);
        if (dtHours <= 0 || dtHours > 1) continue;
        units += ((prevWatts + currWatts) / 2 * dtHours) / 1000;
      }
      return Math.round(units * 100) / 100;
    }

    const todayUnits = await unitsBetween(startOfToday, now);
    const yesterdayUnits = await unitsBetween(startOfYesterday, startOfToday);

    res.json({ todayUnits, yesterdayUnits });
  } catch (err) {
    console.error("Daily summary error:", err.message);
    res.status(500).json({ error: "Failed to calculate daily summary" });
  }
});

// GET /api/meter-reading/spike-check -> is TOTAL draw unusually high right now,
// compared to what it normally is at this time? A single whole-house meter can't
// attribute this to a specific appliance, so we don't try to.
router.get("/spike-check", requireAuth, async (req, res) => {
  try {
    if (!OWNER_USER_ID || req.userId !== OWNER_USER_ID) {
      return res.json({ currentWatts: 0, baselineWatts: 0, diffPct: 0, isSpike: false, comparedTo: null });
    }

    const totalWattsOf = (doc) => (doc.readings || []).reduce((sum, r) => sum + (r.power || 0), 0);

    const latest = await MeterReading.findOne().sort({ receivedAt: -1 });
    if (!latest) {
      return res.json({ currentWatts: 0, baselineWatts: 0, diffPct: 0, isSpike: false, comparedTo: null });
    }

    const currentWatts = Math.round(totalWattsOf(latest) * 100) / 100;
    const now = new Date(latest.receivedAt);

    // Baseline attempt 1: readings within a 15-min window around this exact
    // time yesterday. Most meaningful comparison — accounts for daily routine
    // (e.g. AC on in the evening every day).
    const WINDOW_MS = 15 * 60 * 1000;
    const yesterdaySameTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yWindowDocs = await MeterReading.find({
      receivedAt: {
        $gte: new Date(yesterdaySameTime.getTime() - WINDOW_MS),
        $lte: new Date(yesterdaySameTime.getTime() + WINDOW_MS),
      },
    });

    let baselineWatts = null;
    let comparedTo = null;

    if (yWindowDocs.length > 0) {
      baselineWatts = yWindowDocs.reduce((sum, d) => sum + totalWattsOf(d), 0) / yWindowDocs.length;
      comparedTo = "same time yesterday";
    } else {
      // Baseline attempt 2: no data from yesterday yet (new device) — fall back
      // to today's rolling average over the last 2 hours, excluding the last
      // 2 minutes so a live spike doesn't get absorbed into its own baseline.
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const cutoffRecent = new Date(now.getTime() - 2 * 60 * 1000);
      const recentDocs = await MeterReading.find({
        receivedAt: { $gte: twoHoursAgo, $lte: cutoffRecent },
      });
      if (recentDocs.length > 0) {
        baselineWatts = recentDocs.reduce((sum, d) => sum + totalWattsOf(d), 0) / recentDocs.length;
        comparedTo = "recent average today";
      }
    }

    if (baselineWatts === null) {
      return res.json({ currentWatts, baselineWatts: null, diffPct: 0, isSpike: false, comparedTo: null });
    }

    baselineWatts = Math.round(baselineWatts * 100) / 100;
    const diffPct = baselineWatts > 0 ? Math.round(((currentWatts - baselineWatts) / baselineWatts) * 100) : 0;

    // Spike = at least 50% above baseline AND a meaningful absolute draw, so we
    // don't flag noise when the house is basically idle (e.g. 5W -> 9W is "80%
    // higher" but meaningless).
    const MIN_WATTS_FOR_SPIKE = 300;
    const isSpike = diffPct >= 50 && currentWatts >= MIN_WATTS_FOR_SPIKE;

    res.json({ currentWatts, baselineWatts, diffPct, isSpike, comparedTo, at: latest.receivedAt });
  } catch (err) {
    console.error("Spike-check error:", err.message);
    res.status(500).json({ error: "Failed to check for spikes" });
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