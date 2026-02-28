import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any)?.id;
    const userEmail = session.user?.email;
    
    if (!userId && !userEmail) {
      return NextResponse.json({ error: "No user identifiers in session" }, { status: 400 });
    }

    await dbConnect();
    
    let user = null;
    
    // 1. Try by ID (Fastest)
    if (userId) {
      user = await User.findById(userId).select("-password");
    }

    // 2. Try by Email (Fallback if DB was wiped/changed)
    if (!user && userEmail) {
      user = await User.findOne({ email: userEmail }).select("-password");
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error in /api/user/me:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
