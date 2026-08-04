const express = require("express");
const axios = require("axios");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/", requireAuth, async (req, res) => {
  const { question, language = "en" } = req.body;
  if (!question || typeof question !== "string" || question.length > 500) return res.status(400).json({ error: "Please ask a short question." });
  const languageName = { hi: "Hindi", mr: "Marathi", en: "English" }[language] || "English";
  const prompt = `You are the PowerPulse in-app guide. Answer in ${languageName}, in 2 short sentences maximum. Explain only this app's bill upload, estimate ranges, slab guard, budget, appliance profile, and bill history. Do not claim exact appliance detection or guaranteed bills. Question: ${question}`;
  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent`, { contents: [{ parts: [{ text: prompt }] }] }, { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" } });
    const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) throw new Error("Empty assistant response");
    res.json({ answer });
  } catch (error) { console.error("Assistant error:", error.response?.data || error.message); res.status(503).json({ error: "Guide is temporarily unavailable." }); }
});
module.exports = router;
