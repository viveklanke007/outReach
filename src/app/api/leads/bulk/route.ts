import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { leads } = await req.json();
  const userId = (session.user as any).id;

  await dbConnect();

  const formattedLeads = leads.map((l: any) => ({
    ...l,
    userId,
  }));

  try {
    // Using unordered insert to ignore duplicates if they occur
    await Lead.insertMany(formattedLeads, { ordered: false });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    // If some succeeded, we still return success but maybe with some info
    return NextResponse.json({ success: true, warning: "Some duplicates were skipped" });
  }
}
