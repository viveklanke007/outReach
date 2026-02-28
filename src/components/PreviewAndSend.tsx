"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, AlertCircle, Loader2, Mail, Users, ArrowLeft, RotateCcw, X } from "lucide-react";
import { cn } from "../lib/utils";
import Link from "next/link";

interface Lead {
  _id: string;
  name?: string;
  email: string;
  company?: string;
}

interface Template {
  subject: string;
  body: string;
}

export default function PreviewAndSend() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Record<string, "pending" | "sending" | "sent" | "failed">>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const selectedIdsJson = localStorage.getItem("selectedLeadIds");
      const selectedIds: string[] = selectedIdsJson ? JSON.parse(selectedIdsJson) : [];

      const [leadsRes, templateRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/template"),
      ]);
      const leadsData: any[] = await leadsRes.json();
      const templateData = await templateRes.json();
      
      let targetLeads = leadsData;
      if (selectedIds.length > 0) {
        targetLeads = leadsData.filter((l: any) => selectedIds.includes(l._id));
      } else {
        targetLeads = leadsData.filter((l: any) => l.status === "Not Sent");
      }

      setLeads(targetLeads);
      setTemplate(templateData);
      
      const initialStatus: Record<string, any> = {};
      targetLeads.forEach((l: any) => initialStatus[l._id] = "pending");
      setStatus(initialStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const personalize = (text: string, lead: Lead) => {
    if (!text) return "";
    return text
      .replace(/{name}/g, lead.name || "friend")
      .replace(/{company}/g, lead.company || "your company");
  };

  const handleSendClick = () => {
    setShowConfirm(true);
  };

  const executeSend = async () => {
    setShowConfirm(false);
    
    setSending(true);
    setProgress(0);

    for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        setStatus(prev => ({ ...prev, [lead._id]: "sending" }));

        try {
            const res = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId: lead._id }),
            });

            if (res.ok) {
                setStatus(prev => ({ ...prev, [lead._id]: "sent" }));
            } else {
                setStatus(prev => ({ ...prev, [lead._id]: "failed" }));
            }
        } catch (err) {
            setStatus(prev => ({ ...prev, [lead._id]: "failed" }));
        }

        setProgress(((i + 1) / leads.length) * 100);
        
        if (i < leads.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    setSending(false);
    localStorage.removeItem("selectedLeadIds");
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading leads...</div>;

  if (!template) return (
    <div className="card text-center py-20 space-y-4">
      <Mail className="h-10 w-10 text-slate-300 mx-auto" />
      <h3 className="font-bold text-slate-900">Template missing</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">Please create your email template first before sending outreach.</p>
      <Link href="/template" className="btn btn-primary text-sm mt-4">Create Template</Link>
    </div>
  );

  if (leads.length === 0) return (
    <div className="card text-center py-20 space-y-4">
      <Users className="h-10 w-10 text-slate-300 mx-auto" />
      <h3 className="font-bold text-slate-900">No leads selected</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">Select some leads from the Leads page to start sending emails.</p>
      <Link href="/leads" className="btn btn-primary text-sm mt-4">Go to Leads</Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade pb-20 max-w-5xl">
      <div className="card bg-slate-50 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Send Emails</h2>
            <p className="text-sm text-slate-500">Ready to send to {leads.length} leads.</p>
          </div>
          
          <button
            onClick={handleSendClick}
            disabled={sending}
            className="btn btn-primary gap-3 h-12 px-10 text-base w-full md:w-auto"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {sending ? `Sending ${Math.round(progress)}%` : "Start Sending"}
          </button>
        </div>

        {sending && (
          <div className="mt-8">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-indigo-600 transition-all duration-300" 
                   style={{ width: `${progress}%` }}
                />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Email Preview</h3>
        <div className="grid gap-6">
            {leads.map((lead) => (
              <div 
                key={lead._id}
                className={cn(
                  "card transition-all",
                  status[lead._id] === "sent" ? "border-emerald-200 bg-emerald-50/20" :
                  status[lead._id] === "failed" ? "border-rose-200 bg-rose-50/20" :
                  "border-slate-200"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                      {lead.name ? lead.name.charAt(0) : "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">{lead.name || "None"}</p>
                      <p className="text-xs text-slate-500 mt-1">{lead.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold uppercase tracking-widest">
                    {status[lead._id] === "sent" ? <span className="text-emerald-600">Sent</span> :
                     status[lead._id] === "failed" ? <span className="text-rose-600">Failed</span> :
                     status[lead._id] === "sending" ? <span className="text-indigo-600">Sending...</span> :
                     <span className="text-slate-400">Pending</span>}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Subject</p>
                    <p className="text-sm font-semibold text-slate-900 mb-4">{personalize(template.subject, lead)}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Body</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{personalize(template.body, lead)}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm bg-white shadow-2xl relative animate-fade">
            <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100/50">
                <Send className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Sending</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Are you sure you want to send this email to <span className="font-bold text-slate-900">{leads.length}</span> {leads.length === 1 ? 'lead' : 'leads'}?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary w-full">Cancel</button>
              <button onClick={executeSend} className="btn btn-primary w-full">Yes, Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
