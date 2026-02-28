import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One template per user as per requirements
    },
    subject: {
      type: String,
      required: true,
      default: "Checking in",
    },
    body: {
      type: String,
      required: true,
      default: "Hi {name},\n\nI noticed you are working at {company}...",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Template || mongoose.model("Template", TemplateSchema);
