import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, otp } = await req.json();
    const email = rawEmail.toLowerCase().trim();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Rate Limiting
    const rate = await checkRateLimit(`verify-${email}`, 10, 3600);
    if (!rate.success) {
      return NextResponse.json({ error: `Too many attempts. Try again later.` }, { status: 429 });
    }

    await dbConnect();

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid email or OTP" }, { status: 400 });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ email });
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email });
      return NextResponse.json({ error: "Too many failed attempts. Request a new OTP." }, { status: 400 });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json({ error: "Invalid email or OTP" }, { status: 400 });
    }

    // Success: Verify User
    await User.findOneAndUpdate({ email }, { 
      email_verified: true,
      isVerified: true 
    });
    await OTP.deleteOne({ email });

    return NextResponse.json({ success: true, message: "Account verified successfully" });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Generic Error" }, { status: 500 });
  }
}
