const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");

const {
  signup,
  verifyEmail,
  resendOtp,
  login,
  getMe,
} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

module.exports = router;