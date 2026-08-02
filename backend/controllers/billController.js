const Bill = require("../models/Bill");

// GET bills belonging to the logged-in user only
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.userId }).sort({ createdAt: 1 });
    res.status(200).json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bills" });
  }
};

// POST new bill, stamped with the logged-in user
const createBill = async (req, res) => {
  try {
    const bill = await Bill.create({ ...req.body, user: req.userId });
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create bill" });
  }
};

module.exports = {
  getBills,
  createBill,
};