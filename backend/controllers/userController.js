const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/sendEmail");
const {
  generateOtp,
  hashOtp,
  compareOtp,
  otpExpiry,
  isExpired,
  MAX_ATTEMPTS,
} = require("../utils/otp");

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
  };
}

// =============================
// POST /api/users/signup
// =============================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are all required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailOtpHash: await hashOtp(otp),
      emailOtpExpires: otpExpiry(),
    });

    let emailSendFailed = false;
    try {
      await sendOtpEmail(user.email, otp);
    } catch (err) {
      emailSendFailed = true;
      console.error("Failed to send email OTP:", err.message);
    }

    res.status(201).json({
      message: "Account created. Check your email for a verification code.",
      userId: user._id,
      emailSendFailed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed." });
  }
};

// =============================
// POST /api/users/verify-email   { userId, otp }
// =============================
const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified." });
    }
    if (user.emailOtpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many attempts. Please request a new code." });
    }
    if (isExpired(user.emailOtpExpires)) {
      return res.status(410).json({ message: "Code expired. Please request a new one." });
    }

    const valid = await compareOtp(otp, user.emailOtpHash);
    if (!valid) {
      user.emailOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Incorrect code." });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = null;
    user.emailOtpExpires = null;
    user.emailOtpAttempts = 0;
    await user.save();

    res.status(200).json({ message: "Email verified.", isEmailVerified: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email verification failed." });
  }
};

// =============================
// POST /api/users/resend-otp   { userId }
// =============================
const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified." });
    }

    const otp = generateOtp();
    user.emailOtpHash = await hashOtp(otp);
    user.emailOtpExpires = otpExpiry();
    user.emailOtpAttempts = 0;
    await user.save();
    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: "New code sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend code." });
  }
};

// =============================
// POST /api/users/login   { email, password }
// =============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        userId: user._id,
        isEmailVerified: user.isEmailVerified,
      });
    }

    const token = signToken(user._id);
    res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed." });
  }
};

// =============================
// GET /api/users/me   (protected — req.userId set by authMiddleware)
// =============================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

module.exports = {
  signup,
  verifyEmail,
  resendOtp,
  login,
  getMe,
};