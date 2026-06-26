"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, HardHat, ArrowRight, AlertCircle } from "lucide-react";
import HouseIllustration from "@/components/illustrations/HouseIllustration";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");
      localStorage.setItem("griffy_token", data.token);
      window.location.href = "/feed";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-orange-500/10" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-orange-500/5" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Griffy<span className="text-orange-400">.</span></span>
          </Link>
          <p className="text-stone-400 mt-4 text-lg">Your complete construction partner</p>
        </div>

        <div className="relative z-10 my-8">
          <HouseIllustration className="w-full max-w-sm mx-auto" />
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { emoji: "🧱", text: "10,000+ verified material suppliers" },
            { emoji: "🔨", text: "5,000+ licensed contractors" },
            { emoji: "⚡", text: "50,000+ skilled workers available" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-stone-300">
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">Griffy<span className="text-orange-500">.</span></span>
          </Link>

          <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-500 mb-8">Sign in to continue building your dream</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-stone-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2.5 border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="text-center text-stone-500 text-sm mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
