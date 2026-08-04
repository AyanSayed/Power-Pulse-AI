const express = require("express");
const axios = require("axios");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { question, language = "en", context = {} } = req.body;
  if (!question || typeof question !== "string" || question.length > 500) {
    return res.status(400).json({ error: "Please ask a short question." });
  }

  const languageName = { hi: "Hindi", mr: "Marathi", en: "English" }[language] || "English";

  // Build a short, factual snapshot of the user's real data (only what BillContext already has).
  const facts = [];
  if (context.latestBill) {
    facts.push(`Latest bill: ₹${context.latestBill.bill} for ${context.latestBill.units} units (${context.latestBill.month}).`);
  }
  if (context.estimatedBillRange?.high) {
    facts.push(`Estimated next bill: ₹${context.estimatedBillRange.low}–₹${context.estimatedBillRange.high} (${context.estimatedBillRange.confidence}).`);
  }
  if (context.budgetTarget) {
    facts.push(`Monthly budget target: ₹${context.budgetTarget}.`);
  }
  if (context.slabInfo) {
    facts.push(`Currently in Slab ${context.slabInfo.slab}, ${context.slabInfo.unitsUsed} units used so far this cycle.`);
  }
  const factsBlock = facts.length
    ? `Here is the user's real current data — use it directly to answer if relevant:\n${facts.join("\n")}`
    : "No bill data is available for this user yet — if they ask about their bill, tell them to upload one first.";

  const prompt = `You are the friendly in-app assistant for PowerPulse, an Indian electricity bill app.
Reply in ${languageName}, naturally and conversationally, in 1-3 short sentences.
If the user greets you or makes small talk, respond normally like a helpful assistant would — don't deflect to app features unless asked.
If they ask about their bill, budget, or usage, answer using the real data below when it's available.
Only mention app features (upload, budget, slab guard, appliance profile, bill history) when actually relevant to their question.
Never claim to detect individual appliances or guarantee an exact future bill — our estimates are ranges, not guarantees.

${factsBlock}

User's question: ${question}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent`,
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