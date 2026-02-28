import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import Lead from "../../../models/Lead";
import Template from "../../../models/Template";
import EmailLog from "../../../models/EmailLog";
import { sendGmailEmail } from "../../../services/gmail";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { leadId } = await req.json();

  await dbConnect();

  try {
    const [user, lead, template] = await Promise.all([
      User.findById(userId),
      Lead.findOne({ _id: leadId, userId }),
      Template.findOne({ userId }),
    ]);

    if (!user || !user.gmailRefreshToken) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
    }

    if (!lead || !template) {
      return NextResponse.json({ error: "Lead or Template not found" }, { status: 404 });
    }

    const personalize = (text: string, lead: any) => {
      return text
        .replace(/{name}/g, lead.name)
        .replace(/{company}/g, lead.company || "your company");
    };

    const subject = personalize(template.subject, lead);
    const body = personalize(template.body, lead);

    await sendGmailEmail(user.gmailRefreshToken, lead.email, subject, body);

    // Update lead status
    lead.status = "Sent";
    await lead.save();

    // Log the transaction
    await EmailLog.create({
      userId,
      leadId,
      status: "Sent",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sending error:", err);
    
    // Update lead status to failed
    await Lead.updateOne({ _id: leadId, userId }, { status: "Failed", lastError: err.message });
    
    // Log the failure
    await EmailLog.create({
      userId,
      leadId,
      status: "Failed",
      error: err.message,
    });

    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
