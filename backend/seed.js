const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Bill = require("./models/Bill");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Bill.deleteMany({});

    // Create a demo user
    const user = await User.create({
      name: "Ayan Sharma",
      email: "ayan@example.com",
      password: await bcrypt.hash("demo1234", 10),
    });

    // Create sample bill history
    const bills = [
      { month: "January", units: 220, bill: 1800, status: "Normal" },
      { month: "February", units: 245, bill: 1950, status: "Normal" },
      { month: "March", units: 285, bill: 2300, status: "High" },
      { month: "April", units: 310, bill: 2600, status: "High" },
      { month: "May", units: 295, bill: 2450, status: "Normal" },
    ];

    for (const b of bills) {
      await Bill.create({ ...b, user: user._id });
    }

    console.log("✅ Seed data inserted successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
