"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, CheckCircle2, ArrowRight, MapPin, Calendar, IndianRupee, FileText,
} from "lucide-react";
import { createProject, getMe } from "@/lib/api";

const PROJECT_TYPES = [
  { id: "civil", label: "Civil / Structure", emoji: "🏗️" },
  { id: "electrical", label: "Electrical", emoji: "⚡" },
  { id: "plumbing", label: "Plumbing", emoji: "🔧" },
  { id: "interior", label: "Interior Work", emoji: "🛋️" },
  { id: "structural", label: "Structural", emoji: "🏛️" },
  { id: "painting", label: "Painting", emoji: "🎨" },
  { id: "architecture", label: "Architecture", emoji: "📐" },
  { id: "other", label: "Other", emoji: "🔨" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Other",
];

const TIMELINES = [
  "ASAP (within 1 week)", "1–2 months", "2–4 months", "4–6 months", "6+ months", "Not decided yet",
];

const steps = [
  { label: "Project Details", icon: FileText },
  { label: "Location & Budget", icon: MapPin },
  { label: "Review & Post", icon: CheckCircle2 },
];

export default function PostProjectPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    projectType: "",
    title: "",
    description: "",
    city: "",
    state: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
  });

  useEffect(() => {
    getMe().catch(() => router.replace("/login?redirect=/post-project")).finally(() => setAuthChecked(true));
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await createProject({
        title: form.title,
        description: form.description,
        projectType: form.projectType,
        city: form.city || undefined,
        state: form.state || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        timeline: form.timeline || undefined,
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Failed to post project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Project Posted!</h1>
          <p className="text-stone-500 mb-2">
            Your project <strong className="text-stone-800">&ldquo;{form.title}&rdquo;</strong> is now live.
          </p>
          <p className="text-sm text-stone-400 mb-6">
            Verified contractors can now submit bids. You&apos;ll manage bids from your dashboard.
          </p>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm text-stone-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
              <span>Only <strong>verified contractors</strong> can bid</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Review bids from your <strong>dashboard</strong></span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="btn-primary justify-center">Go to Dashboard</Link>
            <Link href="/projects" className="btn-secondary justify-center">Browse All Projects</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">Post a Project</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Post Your Project</h1>
          <p className="text-stone-500">Get bids from verified contractors. It&apos;s free!</p>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <div key={s.label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${active ? "text-orange-500" : done ? "text-green-500" : "text-stone-300"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${active ? "border-orange-500 bg-orange-50 text-orange-600" : done ? "border-green-500 bg-green-50 text-green-600" : "border-stone-200 text-stone-300"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${done ? "bg-green-400" : "bg-stone-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-extrabold text-stone-900 text-lg">Tell us about your project</h2>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">Project Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setForm({ ...form, projectType: pt.id })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${form.projectType === pt.id ? "border-orange-400 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      <span className="text-2xl">{pt.emoji}</span>
                      <span className="text-center text-xs leading-tight">{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Project Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 3BHK home construction in HSR Layout"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Project Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your project — size, requirements, special considerations..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.projectType || !form.title.trim()}
                className="w-full btn-primary justify-center disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-extrabold text-stone-900 text-lg">Location &amp; Budget</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1 text-orange-500" /> City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">
                  <IndianRupee className="w-4 h-4 inline mr-1 text-orange-500" /> Budget Range (₹)
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">Min ₹</span>
                    <input
                      type="number"
                      min={0}
                      value={form.budgetMin}
                      onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 pl-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">Max ₹</span>
                    <input
                      type="number"
                      min={0}
                      value={form.budgetMax}
                      onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                      placeholder="e.g. 2000000"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 pl-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-1 text-orange-500" /> When do you want to start?
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, timeline: t })}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${form.timeline === t ? "border-orange-400 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 btn-secondary justify-center">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 btn-primary justify-center">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-extrabold text-stone-900 text-lg">Review &amp; Post</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
              )}

              <div className="bg-stone-50 rounded-xl p-5 space-y-3 text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    {PROJECT_TYPES.find((p) => p.id === form.projectType)?.emoji}
                  </span>
                  <div>
                    <p className="font-bold text-stone-900 text-base">{form.title}</p>
                    <p className="text-stone-500 text-xs mt-0.5">
                      {PROJECT_TYPES.find((p) => p.id === form.projectType)?.label}
                    </p>
                  </div>
                </div>
                {form.description && (
                  <p className="text-stone-600 leading-relaxed">{form.description}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-500 text-xs pt-1 border-t border-stone-200">
                  {(form.city || form.state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {[form.city, form.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {(form.budgetMin || form.budgetMax) && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {form.budgetMin && `₹${Number(form.budgetMin).toLocaleString("en-IN")}`}
                      {form.budgetMin && form.budgetMax && " – "}
                      {form.budgetMax && `₹${Number(form.budgetMax).toLocaleString("en-IN")}`}
                    </span>
                  )}
                  {form.timeline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {form.timeline}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 btn-secondary justify-center">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 btn-primary justify-center disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Project 🚀"}
                </button>
              </div>

              <p className="text-xs text-stone-400 text-center">
                By posting, you agree to Griffy&apos;s Terms of Service. Your contact details remain private.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
