const mongoose = require("mongoose");
require("dotenv").config();

console.log("URI loaded:", !!process.env.MONGO_URI);
console.log("URI:", process.env.MONGO_URI.replace(/:(.*?)@/, ":********@"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Full Error:");
    console.error(err);
    process.exit(1);
  });