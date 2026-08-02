const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");

const {
  getBills,
  createBill,
} = require("../controllers/billController");

router.get("/", requireAuth, getBills);
router.post("/", requireAuth, createBill);

module.exports = router;