import nodemailer from "nodemailer";
import RateLimit from "../models/RateLimit";
import dbConnect from "./mongodb";

// --- Rate Limiting ---
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  await dbConnect();
  const now = new Date();
  const windowMs = windowSeconds * 1000;

  let record = await RateLimit.findOne({ key });

  if (!record) {
    record = await RateLimit.create({ key, points: 1, lastRequest: now });
    return { success: true };
  }

  const timePassed = now.getTime() - record.lastRequest.getTime();

  if (timePassed > windowMs) {
    record.points = 1;
    record.lastRequest = now;
    await record.save();
    return { success: true };
  }

  if (record.points >= limit) {
    return { success: false, retryAfter: Math.ceil((windowMs - timePassed) / 1000) };
  }

  record.points += 1;
  record.lastRequest = now;
  await record.save();
  return { success: true };
}

// --- Mailing ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"outReach Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your outReach account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #6366f1;">Welcome to outReach!</h2>
        <p>Use the following code to verify your account. This code expires in 5 minutes.</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="letter-spacing: 5px; font-size: 32px; color: #0f172a; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// --- Validation ---
export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
