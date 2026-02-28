import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import Lead from "../../../models/Lead";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const leads = await Lead.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, company } = await req.json();
  await dbConnect();

  try {
    const lead = await Lead.create({
      userId: (session.user as any).id,
      name,
      email,
      company,
    });
    return NextResponse.json(lead);
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Lead with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await dbConnect();
  await Lead.deleteOne({ _id: id, userId: (session.user as any).id });
  return NextResponse.json({ success: true });
}
