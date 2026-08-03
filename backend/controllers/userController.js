const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are all required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 10) });
    return res.status(201).json({ message: "Account created successfully.", user: publicUser(user) });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Signup failed." }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });
    return res.status(200).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Login failed." }); }
};

const getMe = async (req, res) => {
  try { const user = await User.findById(req.userId); if (!user) return res.status(404).json({ message: "User not found." }); return res.status(200).json({ user: publicUser(user) }); }
  catch (err) { console.error(err); return res.status(500).json({ message: "Failed to fetch user." }); }
};

module.exports = { signup, login, getMe };
