import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    await dbConnect();

    // Clear Gmail related fields
    await User.findByIdAndUpdate(userId, {
      $unset: {
        gmailRefreshToken: "",
        gmailEmail: ""
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error disconnecting Gmail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
