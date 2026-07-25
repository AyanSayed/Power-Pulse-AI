const express = require("express");
const axios = require("axios");
const router = express.Router();
const Bill = require("../models/Bill");

// GET /api/analysis -> AI-powered bill analysis (single-user demo mode)
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).limit(6);

    if (!bills || bills.length === 0) {
      return res.status(404).json({ error: "No bills found yet." });
    }

    const latest = bills[0];
    const previous = bills[1] || null;

    const avgUnits = bills.reduce((sum, b) => sum + (b.units || 0), 0) / bills.length;
    const avgBill = bills.reduce((sum, b) => sum + (b.bill || 0), 0) / bills.length;

    let percentChange = null;
    if (previous && previous.bill) {
      percentChange = (((latest.bill - previous.bill) / previous.bill) * 100).toFixed(1);
    }

    let predictedNextBill = latest.bill;
    if (bills.length >= 2) {
      const diffs = [];
      for (let i = 0; i < bills.length - 1; i++) {
        diffs.push(bills[i].bill - bills[i + 1].bill);
      }
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      predictedNextBill = Math.max(0, latest.bill + avgDiff);
    }

    const stats = {
      latestBill: latest.bill,
      latestUnits: latest.units,
      latestMonth: latest.month,
      previousBill: previous ? previous.bill : null,
      percentChange,
      avgUnits: avgUnits.toFixed(1),
      avgBill: avgBill.toFixed(1),
      predictedNextBill: predictedNextBill.toFixed(1),
      billCount: bills.length,
    };

    const prompt = `
You are an energy usage analyst. Based on this electricity bill data for a household, write a short analysis.

Data:
- Latest bill: ₹${stats.latestBill} for ${stats.latestUnits} units (${stats.latestMonth})
- Previous bill: ${stats.previousBill ? "₹" + stats.previousBill : "N/A"}
- Change vs previous bill: ${stats.percentChange ? stats.percentChange + "%" : "N/A"}
- Average units over last ${stats.billCount} bills: ${stats.avgUnits}
- Average bill amount: ₹${stats.avgBill}
- Predicted next bill: ₹${stats.predictedNextBill}

Respond ONLY in strict JSON, no markdown, no backticks, in this exact format:
{
  "summary": "2-3 sentence plain-English summary of their usage trend",
  "alert": "one sentence flagging if there's an unusual spike, or null if nothing unusual",
  "tips": ["tip 1", "tip 2", "tip 3"]
}
`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    let aiText = geminiRes.data.candidates[0].content.parts[0].text;
    aiText = aiText.replace(/```json|```/g, "").trim();

    let aiInsights;
    try {
      aiInsights = JSON.parse(aiText);
    } catch (parseErr) {
      aiInsights = { summary: "Analysis generated but formatting was unexpected.", alert: null, tips: [] };
    }

    res.json({ stats, insights: aiInsights });
  } catch (err) {
    console.error("AI Analysis error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});

module.exports = router;