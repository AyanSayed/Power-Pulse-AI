const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

// Generates a numeric OTP, e.g. "483920"
function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return crypto.randomInt(min, max + 1).toString();
}

// We never store the raw OTP in the DB — only a bcrypt hash of it,
// the same way we treat passwords. If the DB leaks, no OTPs leak with it.
async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function compareOtp(otp, hash) {
  if (!otp || !hash) return false;
  return bcrypt.compare(otp, hash);
}

function otpExpiry() {
  return new Date(Date.now() + OTP_TTL_MS);
}

function isExpired(expiryDate) {
  if (!expiryDate) return true;
  return new Date() > new Date(expiryDate);
}

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  otpExpiry,
  isExpired,
  OTP_TTL_MS,
  MAX_ATTEMPTS,
};  