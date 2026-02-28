"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, KeyRound, ArrowLeft, RefreshCw, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login/otp-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setResendTimer(60);
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid code" : result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login/otp-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setResendTimer(60);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend code");
      }
    } catch (err) {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fade">
        <Link href="/" className="mb-12 flex items-center gap-2">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
                outReach
            </span>
        </Link>
        
        <div className="card w-full max-w-md bg-white shadow-xl shadow-slate-200/50 p-10">
            {step === 1 ? (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Login</h1>
                <p className="text-sm text-slate-500 mb-10">Sign in to your account to continue.</p>

                <form onSubmit={handleInitLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400">
                                <Mail className="h-[18px] w-[18px]" />
                            </div>
                            <input
                                required
                                type="email"
                                className="input w-full text-sm font-medium"
                                style={{ paddingLeft: "44px" }}
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400">
                                <Lock className="h-[18px] w-[18px]" />
                            </div>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                className="input w-full text-sm font-medium"
                                style={{ paddingLeft: "44px", paddingRight: "44px" }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs font-medium border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full h-11"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Continue"}
                    </button>
                </form>

                <div className="mt-8 flex items-center justify-between">
                    <span className="w-1/5 border-b border-slate-200"></span>
                    <span className="text-xs text-center text-slate-500 font-medium uppercase">Or continue with</span>
                    <span className="w-1/5 border-b border-slate-200"></span>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="btn btn-secondary w-full h-11 flex items-center justify-center gap-3 bg-white"
                        type="button"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="font-semibold text-slate-700">Google</span>
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-indigo-600 font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setStep(1)}
                  className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase"
                >
                    <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
                <p className="text-sm text-slate-500 mb-10">
                  We've sent a code to <span className="font-bold text-slate-900">{email}</span>.
                </p>

                <form onSubmit={handleFinalLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">6-Digit Code</label>
                        <input
                            required
                            type="text"
                            maxLength={6}
                            className="input text-center text-2xl font-bold tracking-[0.5em] h-16"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs font-medium border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="btn btn-primary w-full h-11"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Login"}
                    </button>

                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendTimer > 0 || resending}
                            className={`text-xs font-bold transition-colors uppercase flex items-center justify-center gap-2 mx-auto ${
                                resendTimer > 0 ? "text-slate-300 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-700"
                            }`}
                        >
                            {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                        </button>
                    </div>
                </form>
              </>
            )}
        </div>
    </div>
  );
}
