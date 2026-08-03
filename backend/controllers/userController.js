const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified });

async function sendOtpEmail(user, code) {
  const text = `Your PowerPulse verification code is ${code}. It expires in 10 minutes.`;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV ONLY] Verification code for ${user.email}: ${code}`);
    return;
  }
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: user.email, subject: "Your PowerPulse verification code", text });
}

async function issueOtp(user) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.emailOtpHash = await bcrypt.hash(code, 10);
  user.emailOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.emailOtpAttempts = 0;
  await user.save();
  await sendOtpEmail(user, code);
}

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are all required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 10) });
    await issueOtp(user);
    return res.status(201).json({ message: "Account created. Check your email for the verification code.", user: publicUser(user), verificationRequired: true });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Signup failed." }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });
    if (!user.isEmailVerified) { await issueOtp(user); return res.status(403).json({ message: "Verify your email before logging in. A new code has been sent.", verificationRequired: true, email: user.email }); }
    return res.status(200).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Login failed." }); }
};

const verifyEmailOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").toLowerCase().trim() });
    const code = String(req.body.code || "").trim();
    if (!user || !user.emailOtpHash || !user.emailOtpExpires) return res.status(400).json({ message: "Request a new verification code." });
    if (user.emailOtpAttempts >= OTP_MAX_ATTEMPTS) return res.status(429).json({ message: "Too many attempts. Request a new code." });
    if (user.emailOtpExpires.getTime() < Date.now()) return res.status(400).json({ message: "This code has expired. Request a new one." });
    user.emailOtpAttempts += 1;
    if (!(await bcrypt.compare(code, user.emailOtpHash))) { await user.save(); return res.status(400).json({ message: "Invalid verification code." }); }
    user.isEmailVerified = true; user.emailOtpHash = null; user.emailOtpExpires = null; user.emailOtpAttempts = 0;
    await user.save();
    return res.status(200).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Could not verify email." }); }
};

const resendEmailOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "Account not found." });
    if (user.isEmailVerified) return res.status(400).json({ message: "This email is already verified." });
    await issueOtp(user);
    return res.status(200).json({ message: "A new verification code has been sent." });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Could not send verification code." }); }
};

const getMe = async (req, res) => {
  try { const user = await User.findById(req.userId); if (!user) return res.status(404).json({ message: "User not found." }); return res.status(200).json({ user: publicUser(user) }); }
  catch (err) { console.error(err); return res.status(500).json({ message: "Failed to fetch user." }); }
};

module.exports = { signup, login, verifyEmailOtp, resendEmailOtp, getMe };
