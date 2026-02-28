import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name."],
    },
    email: {
      type: String,
      required: [true, "Please provide an email."],
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    gmailRefreshToken: {
      type: String,
      required: false,
    },
    gmailEmail: {
      type: String,
      required: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    strict: false 
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
