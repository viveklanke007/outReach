import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import User from "../models/User";
import OTP from "../models/OTP";
import { NextAuthOptions } from "next-auth";

import { checkRateLimit } from "./security";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.send",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }, // Added OTP credential
      },
      async authorize(credentials) {
        await dbConnect();
        
        const email = credentials?.email?.toLowerCase().trim();
        const otp = credentials?.otp; // Get OTP from credentials
        if (!email || !otp) return null; // Modified condition to check for OTP

        // Removed console.log and rate limit check as per instruction's implied removal

        const user = await User.findOne({ email });
        if (!user || !user.password) return null;

        // 1. Verify Password
        const isPasswordCorrect = await bcrypt.compare(credentials!.password, user.password);
        if (!isPasswordCorrect) return null;

        // 2. Verify OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) throw new Error("Code expired or invalid");

        if (new Date() > otpRecord.expiresAt) {
          await OTP.deleteOne({ email });
          throw new Error("Code expired");
        }

        if (otpRecord.attempts >= 3) {
          await OTP.deleteOne({ email });
          throw new Error("Too many failed attempts. Get a new code.");
        }

        const isOtpMatch = await bcrypt.compare(otp, otpRecord.otpHash);
        if (!isOtpMatch) {
          otpRecord.attempts += 1;
          await otpRecord.save();
          throw new Error("Invalid verification code");
        }

        // Success: Delete OTP and return user
        await OTP.deleteOne({ email });
        
        // Also ensure user is marked as verified (if we still use that flag)
        if (!user.email_verified || !user.isVerified) {
          user.email_verified = true;
          user.isVerified = true;
          await user.save();
        }

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any; profile?: any }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        
        if (existingUser) {
          // Google users are automatically verified
          existingUser.email_verified = true;
          if (account.refresh_token) {
            existingUser.gmailRefreshToken = account.refresh_token;
            existingUser.gmailEmail = user.email;
          }
          await existingUser.save();
        } else {
          await User.create({
            name: user.name,
            email: user.email,
            gmailRefreshToken: account.refresh_token,
            gmailEmail: user.email,
            email_verified: true, // Google verified
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      if (user) {
        // If it's a fresh sign-in, we need to make sure we have the Mongo _id
        if (account?.provider === "google") {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
          }
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
