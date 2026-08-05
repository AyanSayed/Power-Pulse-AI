require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const weatherRoutes = require("./routes/weather");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const connectDB = require("./config/db");
const billRoutes = require("./routes/billRoutes");
const multer = require("multer");
const fs = require("fs");
const acRoutes = require("./routes/ac.routes");
const { requireAuth } = require("./middleware/authMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

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
// The frontend is deployed on Vercel, including preview URLs.  Configure CORS
// before every route so both successful responses and authentication errors
// include the headers the browser needs to expose them to the frontend.
const allowedOrigin = (origin, callback) => {
    // Requests from non-browser clients (ESP32, curl, Render health checks)
    // do not have an Origin header and should not be blocked.
    if (!origin) return callback(null, true);

    const isAllowed =
        origin === "https://power-pulse-ai.vercel.app" ||
        /^https:\/\/power-pulse-[a-z0-9-]+-vortex-65fe\.vercel\.app$/i.test(origin) ||
        /^http:\/\/localhost(?::\d+)?$/i.test(origin);

    return callback(isAllowed ? null : new Error("CORS origin not allowed"), isAllowed);
};

const corsOptions = {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Device-Key"],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/bills", billRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/analysis", require("./routes/analysis"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/meter-reading", require("./routes/meterReading"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/ac", acRoutes);
app.use("/api/assistant", require("./routes/assistant"));

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 Power Pulse AI Backend is Running...");
});

// =============================
// AI-based bill extraction (Gemini reads the file directly — PDF or image)
// =============================
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const MAX_ATTEMPTS = 3;
    let lastErr;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const geminiRes = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.6-flash"}:generateContent`,
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
        } catch (err) {
            lastErr = err;
            const status = err.response?.data?.error?.code;
            const isRetryable = status === 503 || status === 429;

            console.error(
                `Gemini extraction attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
                err.response?.data || err.message
            );

            if (isRetryable && attempt < MAX_ATTEMPTS) {
                await sleep(1500 * attempt);
                continue;
            }
            throw lastErr;
        }
    }
}

// =============================
// Upload Bill + AI Extraction
// =============================
app.post("/api/upload", requireAuth, (req, res) => {
    upload.single("file")(req, res, async (err) => {
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

            if (!output.bill || !output.units) {
                return res.status(422).json({
                    error: "This doesn't look like a valid electricity bill."
                });
            }

            res.json(output);
        } catch (err) {
            console.error("Processing error:", err.message);
            res.status(500).json({ error: "Failed to process bill." });
        } finally {
            // Uploaded bills may contain personal data. Never leave a copy on disk.
            fs.unlink(req.file.path, () => {});
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
