"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { loginUser } from "@/app/actions/auth";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // router.push("/dashboard");
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-brand-500/20 border border-brand-500/30 p-2 rounded-lg text-brand-500">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-500">
              HireReady
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-2">Sign in to resume your career mentoring sessions</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  name="email"
                  required
                  placeholder="e.g. myusername or user@example.com" 
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-brand-500 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="glow-btn w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl border border-brand-500/20 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-brand-500 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

