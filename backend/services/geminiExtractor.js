const axios = require("axios");

async function extractWithGemini(rawText) {
  try {
    const prompt = `
You are an electricity bill parser.

Extract the following fields from the bill text.

Return ONLY valid JSON.

{
  "consumerNumber": "",
  "units": 0,
  "bill": 0,
  "month": ""
}

Bill Text:
${rawText}
`;

    const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    let text = response.data.candidates[0].content.parts[0].text;

    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);

  } catch (err) {
    console.error("Gemini Extraction Error:", err.response?.data || err.message);

    return null;
  }
}

module.exports = extractWithGemini;