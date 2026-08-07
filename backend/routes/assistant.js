const express = require("express");
const axios = require("axios");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { question, context = {} } = req.body;
  if (!question || typeof question !== "string" || question.length > 500) {
    return res.status(400).json({ error: "Please ask a short question." });
  }

  const facts = [];

  if (context.latestBill) {
    facts.push(`Latest bill: ₹${context.latestBill.bill} for ${context.latestBill.units} units in ${context.latestBill.month} (status: ${context.latestBill.status}).`);
  }
  if (context.previousBill) {
    facts.push(`Previous bill: ₹${context.previousBill.bill} for ${context.previousBill.units} units in ${context.previousBill.month}.`);
  }
  if (typeof context.trendPercent === "number") {
    const direction = context.trendPercent > 0 ? "up" : context.trendPercent < 0 ? "down" : "flat";
    facts.push(`Usage trend: ${direction} ${Math.abs(context.trendPercent).toFixed(1)}% vs previous bill.`);
  }
  if (typeof context.energyScore === "number") {
    facts.push(`Energy score: ${context.energyScore} out of 100.`);
  }
  if (context.estimatedBillRange?.high) {
    facts.push(`Estimated next bill: ₹${context.estimatedBillRange.low}–₹${context.estimatedBillRange.high} (${context.estimatedBillRange.confidence}).`);
  }
  if (context.aiExplanation) {
    facts.push(`Latest AI insight summary: ${context.aiExplanation}`);
  }
  if (typeof context.weatherTemp === "number") {
    facts.push(`Current weather: ${context.weatherTemp}°C${typeof context.weatherHumidity === "number" ? `, ${context.weatherHumidity}% humidity` : ""}.`);
  }
  if (Array.isArray(context.applianceBreakdown) && context.applianceBreakdown.length > 0) {
    const topAppliances = context.applianceBreakdown
      .slice(0, 5)
      .map((a) => `${a.name ?? a.appliance ?? "appliance"}: ${a.units ?? a.percent ?? ""}${a.unit ?? ""}`)
      .join(", ");
    facts.push(`Estimated appliance usage breakdown: ${topAppliances}.`);
  }
  if (context.tierLabel) {
    facts.push(`Data confidence tier: ${context.tierLabel}.`);
  }

  const factsBlock = facts.length
    ? `Here is the user's real current data — use it directly to answer if relevant:\n${facts.join("\n")}`
    : "No bill data is available for this user yet — if they ask about their bill, tell them to upload one first.";

  const prompt = `You are the friendly in-app assistant for PowerPulse, an Indian electricity bill app.
Reply naturally and conversationally, in 1-3 short sentences.
If the user greets you or makes small talk, respond normally like a helpful assistant would — don't deflect to app features unless asked.
If they ask about their bill, usage trend, energy score, weather impact, or appliance breakdown, answer using the real data below when it's available.
Only mention app features (upload, budget, slab guard, appliance profile, bill history) when actually relevant to their question.
Never claim to detect individual appliances with certainty or guarantee an exact future bill — appliance breakdowns and bill estimates are ranges/approximations, not guarantees.

${factsBlock}

User's question: ${question}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" } }
    );
    const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error("Empty assistant response");
    res.json({ answer: answer.trim() });
  } catch (error) {
    console.error("Assistant error:", error.response?.data || error.message);
    res.status(503).json({ error: "Guide is temporarily unavailable." });
  }
});

module.exports = router;
