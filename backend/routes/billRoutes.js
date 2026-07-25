const express = require("express");
const router = express.Router();

const {
  getBills,
  createBill,
} = require("../controllers/billController");

router.get("/", getBills);
router.post("/", createBill);

module.exports = router;