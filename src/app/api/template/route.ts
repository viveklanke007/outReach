import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import Template from "../../../models/Template";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const template = await Template.findOne({ userId: (session.user as any).id });
  return NextResponse.json(template);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body } = await req.json();
  const userId = (session.user as any).id;

  await dbConnect();

  const template = await Template.findOneAndUpdate(
    { userId },
    { subject, body },
    { upsert: true, new: true }
  );

  return NextResponse.json(template);
}
