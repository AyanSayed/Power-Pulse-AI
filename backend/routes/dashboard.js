const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const { requireAuth } = require("../middleware/authMiddleware");

// GET /api/dashboard -> summary stats + trend data for the logged-in user.
router.get("/", requireAuth, async (req, res) => {
  try {
    const allBills = await Bill.find({ user: req.userId }).sort({ createdAt: -1 });

    if (!allBills || allBills.length === 0) {
      return res.status(404).json({ error: "No bills found yet." });
    }

    const totalBills = allBills.length;

    const totalUnits = allBills.reduce((sum, b) => sum + (b.units || 0), 0);
    const totalAmount = allBills.reduce((sum, b) => sum + (b.bill || 0), 0);

    const avgMonthlyConsumption = (totalUnits / totalBills).toFixed(1);
    const avgBillAmount = (totalAmount / totalBills).toFixed(1);

    const latestBill = allBills[0];

    // Trend data: last 6 bills, oldest -> newest (better for chart x-axis order)
    const trendData = allBills
      .slice(0, 6)
      .reverse()
      .map((b) => ({
        month: b.month,
        units: b.units,
        bill: b.bill,
      }));

    res.json({
      totalBills,
      avgMonthlyConsumption: Number(avgMonthlyConsumption),
      avgBillAmount: Number(avgBillAmount),
      latestBill: {
        month: latestBill.month,
        units: latestBill.units,
        bill: latestBill.bill,
        consumerNumber: latestBill.consumerNumber,
      },
      trendData,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

module.exports = router;
