require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
const extractWithGemini = require("./services/geminiExtractor");
const weatherRoutes = require("./routes/weather");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
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
// Test Route
app.get("/", (req, res) => {
    res.send("🚀 Power Pulse AI Backend is Running...");
});

// =============================
// Upload Bill + AI Analysis
// =============================
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

            // Sanity check: did we actually extract meaningful data?
            // If regex missed any important fields, ask Gemini
if (false) {

    console.log("Regex incomplete. Trying Gemini...");

    const geminiResult = await extractWithGemini(output.rawText);

    if (geminiResult) {

        output.consumerNumber =
            output.consumerNumber || geminiResult.consumerNumber;

        output.units =
            output.units || geminiResult.units;

        output.bill =
            output.bill || geminiResult.bill;

        output.month =
            output.month || geminiResult.month;
    }
}

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