require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
require("dotenv").config();
const MeterReading = require("./models/MeterReading");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const recent = await MeterReading.find().sort({ receivedAt: -1 }).limit(5);
  console.log(JSON.stringify(recent, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
