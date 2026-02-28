import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { checkRateLimit, sendOTPEmail, validateEmail } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password } = await req.json();
    const email = rawEmail.toLowerCase().trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Rate Limiting: 10 per hour for login initialization
    const rate = await checkRateLimit(`login-init-${email}`, 10, 3600);
    if (!rate.success) {
      return NextResponse.json({ error: `Too many attempts. Retry in ${rate.retryAfter}s` }, { status: 429 });
    }

    await dbConnect();

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 2. Check if user signed up with Google (no password)
    if (!user.password) {
      return NextResponse.json({ error: "This account uses Google Sign-In. Please use the Google button or re-connect your Gmail." }, { status: 401 });
    }

    // 2. Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 3. Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    // 4. Save OTP
    await OTP.deleteOne({ email });
    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      attempts: 0,
    });

    // 5. Send Email
    try {
      await sendOTPEmail(email, otpCode);
    } catch (mailError) {
      console.error("Failed to send login OTP:", mailError);
      return NextResponse.json({ error: "Failed to send verification code. Check email configuration." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Code sent to your email" });
  } catch (err) {
    console.error("Login init error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
