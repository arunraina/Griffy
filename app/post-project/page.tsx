"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, ArrowRight, MapPin, Calendar, IndianRupee, FileText, Users } from "lucide-react";

const PROJECT_TYPES = [
  { id: "new_home", label: "New Home Construction", emoji: "🏠" },
  { id: "renovation", label: "Renovation / Remodelling", emoji: "🔧" },
  { id: "extension", label: "Floor Extension", emoji: "🏗️" },
  { id: "interior", label: "Interior Work", emoji: "🛋️" },
  { id: "repair", label: "Repair & Maintenance", emoji: "🪛" },
  { id: "commercial", label: "Commercial Space", emoji: "🏢" },
];

const BUDGET_RANGES = [
  "Under ₹5 Lakh", "₹5–10 Lakh", "₹10–25 Lakh", "₹25–50 Lakh", "₹50 Lakh – 1 Crore", "Above ₹1 Crore",
];

const TIMELINES = [
  "ASAP (within a week)", "1–2 months", "2–4 months", "4–6 months", "6+ months", "Not decided yet",
];

const SERVICES_NEEDED = [
  "Civil Contractor", "Architect", "Structural Engineer", "Interior Designer",
  "Electrician", "Plumber", "Painter", "Tiles & Flooring", "Waterproofing",
];

const INDIAN_CITIES = [
  "Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Coimbatore", "Mysuru", "Surat", "Other",
];

export default function PostProjectPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    projectType: "",
    title: "",
    description: "",
    city: "",
    area: "",
    budget: "",
    timeline: "",
    services: [] as string[],
    name: "",
    phone: "",
    email: "",
  });

  function toggleService(s: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  }

  function nextStep() { setStep((s) => Math.min(s + 1, 3)); }
  function prevStep() { setStep((s) => Math.max(s - 1, 1)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Project Posted!</h1>
          <p className="text-stone-500 mb-2">Your project "<strong className="text-stone-800">{form.title || "New Project"}</strong>" is live.</p>
          <p className="text-sm text-stone-400 mb-6">Verified contractors in your area will send you quotes within 24 hours. You can compare and pick the best fit.</p>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm text-stone-600">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /><span>Estimated <strong>3–8 quotes</strong> expected</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" /><span>Quotes arrive within <strong>24 hours</strong></span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /><span>Only <strong>verified contractors</strong> can bid</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/feed" className="btn-primary justify-center">Go to Feed</Link>
            <Link href="/contractors" className="btn-secondary justify-center">Browse Contractors</Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Project Details", icon: FileText },
    { label: "Location & Budget", icon: MapPin },
    { label: "Contact Info", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Post Your Project</h1>
          <p className="text-stone-500">Get quotes from verified contractors in your city within 24 hours. It's free!</p>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setForm({ ...form, projectType: pt.id })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-semibold ${form.projectType === pt.id ? "border-orange-400 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      <span className="text-2xl">{pt.emoji}</span>
                      <span className="text-center leading-tight">{pt.label}</span>
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
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Project Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your project — size, requirements, special considerations..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">Services Needed (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES_NEEDED.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.services.includes(s) ? "bg-orange-500 text-white border-orange-500" : "border-stone-200 text-stone-600 hover:border-stone-400"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!form.projectType || !form.title}
                className="w-full btn-primary justify-center disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-extrabold text-stone-900 text-lg">Location & Budget</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1 text-orange-500" /> City *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Select city</option>
                    {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Plot / Built-up Area</label>
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="e.g. 1200 sq ft"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">
                  <IndianRupee className="w-4 h-4 inline mr-1 text-orange-500" /> Budget Range *
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm({ ...form, budget: b })}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${form.budget === b ? "border-orange-400 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      {b}
                    </button>
                  ))}
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
                <button onClick={prevStep} className="flex-1 btn-secondary justify-center">Back</button>
                <button
                  onClick={nextStep}
                  disabled={!form.city || !form.budget}
                  className="flex-1 btn-primary justify-center disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-extrabold text-stone-900 text-lg">Your contact details</h2>
              <p className="text-sm text-stone-500">Only shared with contractors you approve. Never shown publicly.</p>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rajesh Kumar"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  pattern="[6-9]\d{9}"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div className="bg-stone-50 rounded-xl p-4 text-sm space-y-2 text-stone-600">
                <p className="font-bold text-stone-900">Project Summary</p>
                <p>📋 {form.title}</p>
                <p>📍 {form.city} · {form.area || "Area not specified"}</p>
                <p>💰 {form.budget}</p>
                <p>📅 {form.timeline || "Timeline not selected"}</p>
                {form.services.length > 0 && <p>🔧 {form.services.join(", ")}</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={prevStep} className="flex-1 btn-secondary justify-center">Back</button>
                <button type="submit" className="flex-1 btn-primary justify-center">
                  Post Project 🚀
                </button>
              </div>

              <p className="text-xs text-stone-400 text-center">
                By posting, you agree to Griffy's Terms of Service. Contractors will contact you only after your approval.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
