"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Mail, CheckCircle, Link2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, [session]);

  const checkConnection = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }
      const data = await res.json();
      setConnected(!!data.gmailRefreshToken);
    } catch (err) {
      console.error("Connection check failed:", err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this Gmail account?")) return;
    try {
      const res = await fetch("/api/user/disconnect-gmail", { method: "POST" });
      if (res.ok) {
        setConnected(false);
      }
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8 animate-fade">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and integrations.</p>
      </header>

      <div className="space-y-6">
        <div className="card bg-white shadow-sm border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Mail className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Gmail Integration</h3>
                        <p className="text-sm text-slate-500">Connect your account to send emails.</p>
                    </div>
                </div>

                {connected ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold border border-green-200">
                      <CheckCircle className="h-4 w-4" /> Connected
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold border border-red-200 transition-colors"
                    >
                      Disconnect
                    </button>                 
                  </div>
                ) : (
                  <button
                    onClick={() => signIn("google", { prompt: "select_account" })}
                    className="btn btn-primary text-sm gap-2 w-full md:w-auto"
                  >
                    <Link2 className="h-4 w-4" /> Connect Gmail
                  </button>
                )}
            </div>
        </div>

        <div className="card bg-white shadow-sm border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Account information</h3>
            <div className="space-y-4 mt-6">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Logged in as</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{session?.user?.name || "N/A"}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{session?.user?.email || "N/A"}</p>
                </div>
            </div>
        </div>

        <div className="card bg-rose-50 border-rose-100">
            <h3 className="font-bold text-rose-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-rose-700/70 mb-6">Once you logout, you will need to login again to access your dashboard.</p>
            <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn bg-rose-600 text-white text-sm gap-2 hover:bg-rose-700 w-full md:w-auto"
            >
                <LogOut className="h-4 w-4" /> Logout
            </button>
        </div>
      </div>
    </div>
  );
}
