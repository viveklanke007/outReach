"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Info } from "lucide-react";

export default function TemplateEditor() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await fetch("/api/template");
      const data = await res.json();
      if (data) {
        setSubject(data.subject);
        setBody(data.body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl space-y-6 animate-pulse">
        <div className="h-64 bg-slate-50 rounded-xl w-full"></div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Email Template</h2>
            <p className="text-slate-500 text-sm mt-1">Create your standard email template for outreach.</p>
        </div>
        <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary gap-2 h-11 px-8 w-full md:w-auto"
        >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      <div className="card space-y-6 bg-white shadow-sm border-slate-200">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Subject</label>
          <input
            type="text"
            className="input text-base"
            placeholder="e.g. Question about {company}"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message Body</label>
            <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Available: {"{name}"}, {"{company}"}
            </div>
          </div>
          <textarea
            className="input h-96 text-base resize-none"
            placeholder="Hi {name},..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-lg flex items-start gap-3 border border-slate-200">
            <Info className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Use curly braces like {"{name}"} to automatically insert lead information. Make sure the lead has the corresponding field data.</p>
        </div>
      </div>
    </div>
  );
}
