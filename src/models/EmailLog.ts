import mongoose from "mongoose";

const EmailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    status: {
      type: String,
      enum: ["Sent", "Failed"],
      required: true,
    },
    error: {
      type: String,
      required: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmailLog || mongoose.model("EmailLog", EmailLogSchema);
