import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  lastRequest: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
