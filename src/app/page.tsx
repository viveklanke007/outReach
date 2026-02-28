"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Shield, Zap, Send, Users, Github, Linkedin, X } from "lucide-react";

export default function LandingPage() {
  const [showDeveloper, setShowDeveloper] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Send className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
                outReach
            </span>
        </Link>
        <div className="flex items-center gap-8">
          <button onClick={() => setShowDeveloper(true)} className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            About Developer
          </button>
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link 
            href="/signup" 
            className="btn btn-primary text-sm px-6 h-10"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-40 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-8 tracking-tight">
          Simple bulk email <br /> outreach for startups.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          Send personalized emails to your leads in minutes. Connect your Gmail, upload a list, and start your campaign.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto btn btn-primary px-10 h-14 text-lg"
          >
            Try for free
          </Link>
          <Link 
             href="/login"
            className="w-full sm:w-auto btn btn-secondary px-10 h-14 text-lg"
          >
            Sign in
          </Link>
        </div>
      </main>

      <section className="bg-slate-50 py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="card border-none shadow-none bg-transparent">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Secure Login</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Connect your Gmail securely via OAuth 2.0. We never store your password.</p>
            </div>
            <div className="card border-none shadow-none bg-transparent">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Lead Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Manage your leads manually or upload a CSV file to add them in bulk.</p>
            </div>
            <div className="card border-none shadow-none bg-transparent">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Fast Sending</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Draft your template once and send it to hundreds of leads with one click.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-slate-100 mt-20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Send className="h-5 w-5 text-indigo-600" />
          <span className="font-bold tracking-tight text-slate-900">outReach</span>
        </div>
        <p className="text-slate-500 text-sm">&copy; 2024 outReach. All rights reserved.</p>
      </footer>

      {showDeveloper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade">
          <div className="relative w-full max-w-4xl rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-700/50 shadow-2xl p-8 md:p-12">
            <button 
              onClick={() => setShowDeveloper(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 transform scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                <img 
                  src="/photo.jpeg" 
                  alt="Vivek Lanke" 
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-slate-700/50 shadow-2xl"
                />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">Vivek Lanke</h3>
                <p className="text-indigo-400 font-medium mb-6 uppercase tracking-wider text-sm flex items-center justify-center md:justify-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Full Stack Developer
                </p>
                
                <p className="text-slate-300 leading-relaxed mb-8">
                  Passionate about building scalable SaaS applications and creating intuitive user experiences. 
                  Dedicated to writing clean, maintainable code and turning complex problems into elegant, reliable solutions.
                </p>
                
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <a href="https://github.com/viveklanke007" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 group">
                    <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="https://www.linkedin.com/in/vivek-lanke-87a1a628a/" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 hover:shadow-[0_0_20px_rgba(10,102,194,0.2)] transition-all duration-300 group">
                    <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="mailto:viveklanke100@gmail.com" className="h-12 w-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all duration-300 group">
                    <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
