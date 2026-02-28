import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import Lead from "../../../models/Lead";
import EmailLog from "../../../models/EmailLog";
import { 
  Users, 
  Send, 
  Clock, 
  AlertCircle,
  BarChart3
} from "lucide-react";
import StatsChart from "../../../components/StatsChart";

async function getStats(userId: string) {
  await dbConnect();
  
  const [totalLeads, sentEmails, failedEmails, pendingLeads] = await Promise.all([
    Lead.countDocuments({ userId }),
    EmailLog.countDocuments({ userId, status: "Sent" }),
    EmailLog.countDocuments({ userId, status: "Failed" }),
    Lead.countDocuments({ userId, status: "Not Sent" })
  ]);
  return {
    raw: { sentEmails, failedEmails, pendingLeads },
    cards: [
      { name: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { name: "Sent", value: sentEmails, icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
      { name: "Remaining", value: pendingLeads, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { name: "Failed", value: failedEmails, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
    ]
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { raw, cards } = await getStats((session?.user as any)?.id);

  return (
    <div className="animate-fade p-2 md:p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {session?.user?.name || "User"}.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat) => (
          <div key={stat.name} className="card flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card h-80 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-6">
                <h3 className="font-bold text-slate-900">Outreach Overview</h3>
                <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>
            <StatsChart 
              sent={raw.sentEmails} 
              failed={raw.failedEmails} 
              remaining={raw.pendingLeads} 
            />
        </div>

        <div className="card h-80 bg-slate-50 border-dashed flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-900">Start new campaign</p>
            <p className="text-xs text-slate-500 mt-1 mb-6">Reach out to your leads now.</p>
            <a href="/leads" className="btn btn-primary text-sm px-6">
              Go to Leads
            </a>
        </div>
      </div>
    </div>
  );
}
