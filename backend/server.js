require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const weatherRoutes = require("./routes/weather");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const connectDB = require("./config/db");
const billRoutes = require("./routes/billRoutes");
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
const fs = require("fs");

async function extractBillDataFromFile(filePath, mimeType) {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    const prompt = `
You are an expert at reading electricity/utility bills from any country, provider, or template format.
Look carefully at the attached bill and extract the following fields.

Respond ONLY in strict JSON, no markdown, no backticks, in this exact format:
{
  "consumerNumber": "the account/consumer/CA number as a string, or empty string if not found",
  "units": total units consumed in kWh as a number (no units/text, just the number), or 0 if not found,
  "bill": the final total or net amount payable as a decimal number (no currency symbol or commas), or 0 if not found,
  "month": "the billing month name, e.g. 'August', or empty string if not found"
}
`;

    const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
        {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data,
                            },
                        },
                    ],
                },
            ],
        },
        {
            headers: {
                "x-goog-api-key": process.env.GEMINI_API_KEY,
                "Content-Type": "application/json",
            },
        }
    );

    let aiText = geminiRes.data.candidates[0].content.parts[0].text;
    aiText = aiText.replace(/```json|```/g, "").trim();

    return JSON.parse(aiText);
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

            let output;
            try {
                output = await extractBillDataFromFile(req.file.path, req.file.mimetype);
            } catch (aiErr) {
                console.error("Gemini bill extraction failed:", aiErr.response?.data || aiErr.message);
                return res.status(422).json({ error: "Could not read this bill. Try a clearer scan or a digital PDF." });
            }

            // Clean up the temp uploaded file now that we're done with it.
            fs.unlink(req.file.path, () => {});

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