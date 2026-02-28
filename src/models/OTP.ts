import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: document will auto-delete when expiresAt is reached
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
