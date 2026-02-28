import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Not Sent", "Sent", "Failed"],
      default: "Not Sent",
    },
    lastError: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user doesn't have duplicate lead emails
LeadSchema.index({ userId: 1, email: 1 }, { unique: true });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
