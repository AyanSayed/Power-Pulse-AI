const Bill = require("../models/Bill");

// GET all bills
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: 1 });
    res.status(200).json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bills" });
  }
};

// POST new bill
const createBill = async (req, res) => {
  try {
    const bill = await Bill.create(req.body);
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