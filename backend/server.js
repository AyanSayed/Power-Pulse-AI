require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const weatherRoutes = require("./routes/weather");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const connectDB = require("./config/db");
const billRoutes = require("./routes/billRoutes");
const { PythonShell } = require("python-shell");
const path = require("path");
const multer = require("multer");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Multer setup
// Multer setup — restrict to PDF/JPG/PNG, max 5MB
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("INVALID_FILE_TYPE"));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/bills", billRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/analysis", require("./routes/analysis"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/meter-reading", require("./routes/meterReading"));
app.use("/api/users", require("./routes/userRoutes"));
// Test Route
app.get("/", (req, res) => {
    res.send("🚀 Power Pulse AI Backend is Running...");
});

// =============================
// AI-based bill extraction fallback
// =============================
// Used only when the regex parser in analysis.py can't find the key
// fields (bill/units), which happens whenever a bill uses a layout the
// regex patterns weren't written for. Sends the raw extracted PDF text
// to Gemini and asks it to find the same fields regex was looking for.
// This keeps the fast/free regex path as the default, and only pays for
// an AI call on unfamiliar bill formats.
async function extractBillDataWithAI(rawText) {
    const prompt = `
You are an expert at reading electricity/utility bills from any country, provider, or template format.
Extract the following fields from the raw bill text below.

Respond ONLY in strict JSON, no markdown, no backticks, in this exact format:
{
  "consumerNumber": "the account/consumer/CA number as a string, or empty string if not found",
  "units": total units consumed in kWh as a number (no units/text, just the number), or 0 if not found,
  "bill": the final total or net amount payable as a decimal number (no currency symbol or commas), or 0 if not found,
  "month": "the billing month name, e.g. 'August', or empty string if not found"
}

Raw bill text:
"""
${rawText}
"""
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

    return JSON.parse(aiText); // let caller catch parse errors
}

// =============================
// Upload Bill + AI Analysis
// =============================
app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, async (err) => {
        // Handle multer-specific errors (size limit, wrong file type)
        if (err) {
            if (err.message === "INVALID_FILE_TYPE") {
                return res.status(400).json({ error: "Only PDF, JPG, and PNG files are allowed." });
            }
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: "File is too large. Max size is 5MB." });
            }
            console.error("Upload error:", err.message);
            return res.status(400).json({ error: "File upload failed." });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        try {
            console.log("Uploaded:", req.file.filename);

            const results = await PythonShell.run(
                path.join(__dirname, "../ai/analysis.py"),
                {
                    pythonPath: "python",
                    args: [req.file.path]
                }
            );

            if (!results || results.length === 0) {
                return res.status(422).json({ error: "Could not extract data from this file. Try a clearer scan or a digital PDF." });
            }

            let output;
            try {
                output = JSON.parse(results.join(""));
            } catch (parseErr) {
                console.error("Failed to parse analysis.py output:", results);
                return res.status(422).json({ error: "Could not read this bill. The file format may not be supported." });
            }

            // Regex parsing failed to find the key fields -> fall back to
            // AI-based extraction using the raw text analysis.py included.
            if ((!output.bill || !output.units) && output.rawText) {
                console.log("Regex parsing incomplete, falling back to AI extraction...");
                try {
                    const aiOutput = await extractBillDataWithAI(output.rawText);
                    output = {
                        consumerNumber: aiOutput.consumerNumber || output.consumerNumber || "",
                        units: aiOutput.units || output.units || 0,
                        bill: aiOutput.bill || output.bill || 0,
                        month: aiOutput.month || output.month || "",
                    };
                } catch (aiErr) {
                    console.error("AI bill extraction failed:", aiErr.response?.data || aiErr.message);
                    // Fall through to the sanity check below, which will
                    // 422 if the AI fallback didn't rescue the data either.
                }
            }

            // Never send the full raw bill text back to the client.
            delete output.rawText;

            // Sanity check: did we actually extract meaningful data?
            // If regex missed any important fields, ask Gemini


// Final validation
if (!output.bill || !output.units) {
    return res.status(422).json({
        error: "This doesn't look like a valid electricity bill."
    });
}

            res.json(output);
        } catch (err) {
            console.error("Processing error:", err.message);
            res.status(500).json({ error: "Failed to process bill." });
        }
    });
});

// =============================
// Upload CSV
// =============================
app.post("/api/upload-csv", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No CSV file uploaded"
            });
        }

        console.log("Uploaded file:", req.file);

        res.json({
            message: "CSV uploaded successfully",
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Upload failed"
        });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});