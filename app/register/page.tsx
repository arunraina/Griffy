"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, HardHat, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import ConstructionIllustration from "@/components/illustrations/ConstructionIllustration";

const roles = [
  { value: "homeowner", label: "Homeowner", emoji: "🏠", desc: "I'm building / renovating my home" },
  { value: "contractor", label: "Contractor", emoji: "🔨", desc: "I provide construction services" },
  { value: "labour", label: "Labour", emoji: "⚒️", desc: "I'm a skilled daily-wage worker" },
  { value: "supplier", label: "Supplier", emoji: "🧱", desc: "I supply construction materials" },
];

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", role: "homeowner", city: "", state: "",
  });

  const passwordStrength = passwordRules.filter((r) => r.test(form.password)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("griffy_token", data.token);
      window.location.href = "/onboarding";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left illustration */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-orange-500 to-orange-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />

        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Griffy<span className="text-orange-200">.</span></span>
        </Link>

        <div className="relative z-10">
          <ConstructionIllustration className="w-full max-w-xs mx-auto" />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-3">Join 1,20,000+<br/>Homeowners & Pros</h2>
          <p className="text-orange-100 text-sm leading-relaxed">
            Create your free account and get instant access to verified materials, contractors, and skilled labour across India.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            ))}
            <span className="text-orange-100 text-sm ml-1">4.9 / 5 from 12,000+ reviews</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 overflow-y-auto bg-white py-10 px-6 sm:px-12 flex flex-col justify-center">
        <div className="max-w-lg w-full mx-auto">
          <Link href="/" className="flex items-center gap-2 lg:hidden mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">Griffy<span className="text-orange-500">.</span></span>
          </Link>

          <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Create your account</h1>
          <p className="text-stone-500 mb-8">Free forever. No credit card required.</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-stone-700 mb-3">I am a…</p>
            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: role.value })}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    form.role === role.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">{role.emoji}</span>
                  <div>
                    <p className={`font-semibold text-sm ${form.role === role.value ? "text-orange-600" : "text-stone-800"}`}>{role.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-tight">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Rajan Kumar"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Bengaluru"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">State</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm bg-white"
                >
                  <option value="">Select state</option>
                  {["Andhra Pradesh","Delhi","Gujarat","Karnataka","Kerala","Maharashtra","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
                        i < passwordStrength
                          ? passwordStrength === 1 ? "bg-red-400" : passwordStrength === 2 ? "bg-yellow-400" : "bg-green-500"
                          : "bg-stone-200"
                      }`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {passwordRules.map((rule) => (
                      <span key={rule.label} className={`flex items-center gap-1 text-xs ${rule.test(form.password) ? "text-green-600" : "text-stone-400"}`}>
                        <CheckCircle2 className="w-3 h-3" /> {rule.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-stone-400">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-orange-500 hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>.
            </p>

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
                  Creating account...
                </span>
              ) : (
                <>Create Free Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
