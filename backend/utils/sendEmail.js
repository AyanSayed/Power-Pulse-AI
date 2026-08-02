const nodemailer = require("nodemailer");

// Gmail + an "app password" (not your normal Gmail password).
// Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"PowerPulse" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your PowerPulse verification code",
    text: `Your PowerPulse verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#0f172a;">PowerPulse verification code</h2>
        <p style="color:#475569;">Use the code below to verify your email address. It expires in 5 minutes.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; background:#f1f5f9; padding: 16px 24px; border-radius: 8px; text-align:center; color:#0f172a;">
          ${otp}
        </div>
        <p style="color:#94a3b8; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };