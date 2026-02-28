import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

import { checkRateLimit, validateEmail, sendOTPEmail } from "../../../../lib/security";
import OTP from "../../../../models/OTP";

export async function POST(req: Request) {
  try {
    const { name, email: rawEmail, password } = await req.json();
    
    // Normalize and validate email
    const email = rawEmail.toLowerCase().trim();
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Rate Limiting
    const rate = await checkRateLimit(`signup-${email}`, 5, 3600); // 5 per hour
    if (!rate.success) {
      return NextResponse.json({ error: `Too many attempts. Try again in ${rate.retryAfter}s` }, { status: 429 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified, we can allow re-signup (overwrite) or just tell them to verify
      if (existingUser.email_verified) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
      }
      // If not verified, update their info
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.name = name;
      existingUser.password = hashedPassword;
      await existingUser.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        password: hashedPassword,
        email_verified: false,
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    // Save OTP to DB
    await OTP.deleteOne({ email }); // Delete any old OTPs
    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      attempts: 0,
    });

    // Send Email
    try {
      await sendOTPEmail(email, otpCode);
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
      return NextResponse.json({ error: "Could not send verification email. Please check your system configuration." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent to email", email });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Generic Signup error" }, { status: 500 });
  }
}
