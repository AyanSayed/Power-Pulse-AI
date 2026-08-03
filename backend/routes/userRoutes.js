const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");

const {
  signup,
  login,
  getMe,
  verifyEmailOtp,
  resendEmailOtp,
} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmailOtp);
router.post("/resend-email-otp", resendEmailOtp);
router.get("/me", requireAuth, getMe);

module.exports = router;
