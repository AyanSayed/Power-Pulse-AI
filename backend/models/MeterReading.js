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
module.exports = mongoose.model("MeterReading", meterReadingSchema);
