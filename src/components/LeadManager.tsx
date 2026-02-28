"use client";

import { useState, useEffect } from "react";
import { Plus, Upload, Trash2, Search, X, Check, FileSpreadsheet, MoreHorizontal } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "../lib/utils";
import { useRouter } from "next/navigation";

interface Lead {
  _id: string;
  name?: string;
  email: string;
  company?: string;
  status: string;
}

export default function LeadManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewLead({ name: "", email: "", company: "" });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const processLeads = async (rawLeads: any[]) => {
    const formatted = rawLeads.map((row: any) => ({
      name: row.Name || row.name || row["Full Name"] || "",
      email: row.Email || row.email || row["Email Address"] || "",
      company: row.Company || row.company || row.Organization || "",
    })).filter(l => l.email);

    try {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: formatted }),
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, { header: true, complete: (res) => processLeads(res.data) });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        processLeads(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(l => l._id)));
  };

  const toggleLead = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const filtered = leads.filter(l => 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Leads</h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400">
                    <Search className="h-[18px] w-[18px]" />
                </div>
                <input
                    type="text"
                    placeholder="Search leads..."
                    className="input text-sm h-10 w-full md:w-64"
                    style={{ paddingLeft: "40px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>           
            <label className="btn btn-secondary text-sm h-10 gap-2 px-4 cursor-pointer flex-1 md:flex-none">
                <Upload className="h-4 w-4" /> Import
                <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary text-sm h-10 gap-2 px-4 flex-1 md:flex-none">
                <Plus className="h-4 w-4" /> Add Lead
            </button>
            {selected.size > 0 && (
                <button 
                  onClick={() => {
                    localStorage.setItem("selectedLeadIds", JSON.stringify(Array.from(selected)));
                    router.push("/preview");
                  }}
                  className="btn bg-slate-900 text-white text-sm h-10 gap-2 px-6 w-full md:w-auto mt-2 md:mt-0"
                >
                  Send to {selected.size} leads
                </button>
            )}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">
                 <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-slate-300 pointer-events-auto"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                 />
              </th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-6 py-6 h-16 bg-slate-50/50"></td></tr>)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500">No leads found.</td></tr>
            ) : (
              filtered.map(lead => (
                <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-slate-300"
                      checked={selected.has(lead._id)}
                      onChange={() => toggleLead(lead._id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{lead.name || "-"}</td>
                  <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                  <td className="px-6 py-4 text-slate-600">{lead.company || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      lead.status === "Sent" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(lead._id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm">
          <div className="card w-full max-w-md bg-white shadow-xl relative animate-fade">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Add New Lead</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Name</label>
                  <input type="text" className="input text-sm" placeholder="John Doe" value={newLead.name} onChange={(e) => setNewLead({...newLead, name:e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                  <input required type="email" className="input text-sm" placeholder="john@example.com" value={newLead.email} onChange={(e) => setNewLead({...newLead, email:e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Company</label>
                  <input type="text" className="input text-sm" placeholder="Acme Corp" value={newLead.company} onChange={(e) => setNewLead({...newLead, company:e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">Save Lead</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
