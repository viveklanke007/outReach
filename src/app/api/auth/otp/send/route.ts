import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { checkRateLimit, sendOTPEmail } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Rate Limiting: 5 per hour
    const rate = await checkRateLimit(`resend-${email}`, 5, 3600);
    if (!rate.success) {
      return NextResponse.json({ error: `Too many requests. Try again in ${rate.retryAfter}s` }, { status: 429 });
    }

    await dbConnect();

    // Ensure user exists and is unverified
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    // Save/Update OTP
    await OTP.deleteOne({ email });
    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    });

    // Send Email
    await sendOTPEmail(email, otpCode);

    return NextResponse.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Generic Error" }, { status: 500 });
  }
}
