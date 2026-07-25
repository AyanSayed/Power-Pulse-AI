const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { PythonShell } = require("python-shell");
const path = require("path");
const multer = require("multer");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const upload = multer({
    dest: "uploads/"
});

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 Power Pulse AI Backend is Running...");
});

// AI Analysis Route
app.get("/api/analysis", async (req, res) => {
try {
    const results = await PythonShell.run(
        path.join(__dirname, "../ai/analysis.py"),
        {
            pythonPath: "python",
            args: [req.file.path]
        }
    );

    res.json(JSON.parse(results[results.length - 1]));

} catch (err) {
    console.error(err);   // Add ONLY this line
    res.status(500).json({ error: "Failed to run AI analysis" });
}
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        console.log("Uploaded:", req.file.filename);

        const results = await PythonShell.run(
    path.join(__dirname, "../ai/analysis.py"),
    {
        pythonPath: "python",
        args: [req.file.path]
    }
);

        const output = JSON.parse(results.join(""));

        res.json(output);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to process CSV"
        });
    }
});
// Server
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});