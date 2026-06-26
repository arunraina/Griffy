"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, HardHat, CheckCircle2, MapPin, User, Briefcase, Star } from "lucide-react";
import {
  HomeownerIllustration,
  ContractorIllustration,
  LabourIllustration,
  SupplierIllustration,
  SuccessIllustration,
} from "@/components/illustrations/OnboardingIllustrations";

const TOTAL_STEPS = 5;

const roleIllustrations: Record<string, React.FC> = {
  homeowner: HomeownerIllustration,
  contractor: ContractorIllustration,
  labour: LabourIllustration,
  supplier: SupplierIllustration,
};

const roleFeatures: Record<string, string[]> = {
  homeowner: ["Browse 10,000+ verified materials", "Get quotes from top contractors", "Hire skilled workers by the day", "Track your project & payments"],
  contractor: ["Receive project leads in your city", "Showcase your portfolio & reviews", "Manage multiple projects at once", "Get paid securely via escrow"],
  labour: ["Find daily work near you", "Set your availability & rates", "Build your verified profile", "Get paid on time, every time"],
  supplier: ["List unlimited products", "Reach 1,20,000+ homeowners", "Manage orders & delivery", "Grow your B2B network"],
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("homeowner");
  const [location, setLocation] = useState({ city: "", state: "", pincode: "" });
  const [profile, setProfile] = useState({
    projectType: "", budget: "", timeline: "",
    businessName: "", experience: "", trade: "",
    materialCategories: [] as string[],
  });
  const [interests, setInterests] = useState<string[]>([]);

  const Illustration = roleIllustrations[role] || HomeownerIllustration;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const toggleInterest = (item: string) =>
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <HardHat className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-stone-900">Griffy<span className="text-orange-500">.</span></span>
            </Link>
            <span className="text-sm text-stone-500">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-5">
            {/* Illustration panel */}
            <div className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-amber-50 p-8 flex flex-col items-center justify-center min-h-[280px]">
              <div className="w-52 h-52">
                {step === TOTAL_STEPS ? <SuccessIllustration /> : <Illustration />}
              </div>
              {step < TOTAL_STEPS && (
                <ul className="mt-6 space-y-2 w-full max-w-xs">
                  {roleFeatures[role]?.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-stone-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Form panel */}
            <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">

              {/* Step 1 — Role */}
              {step === 1 && (
                <div>
                  <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">Welcome to Griffy</p>
                  <h2 className="text-2xl font-extrabold text-stone-900 mb-1">How will you use Griffy?</h2>
                  <p className="text-stone-500 text-sm mb-7">We&apos;ll personalise your experience based on your role.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "homeowner", emoji: "🏠", label: "Homeowner", sub: "Build or renovate" },
                      { value: "contractor", emoji: "🔨", label: "Contractor", sub: "Take on projects" },
                      { value: "labour", emoji: "⚒️", label: "Labour / Mistri", sub: "Find daily work" },
                      { value: "supplier", emoji: "🧱", label: "Supplier", sub: "Sell materials" },
                    ].map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all hover:border-orange-300 ${
                          role === r.value ? "border-orange-500 bg-orange-50" : "border-stone-200"
                        }`}
                      >
                        <span className="text-3xl">{r.emoji}</span>
                        <span className={`font-bold text-sm ${role === r.value ? "text-orange-600" : "text-stone-800"}`}>{r.label}</span>
                        <span className="text-xs text-stone-500">{r.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Location */}
              {step === 2 && (
                <div>
                  <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">Location</p>
                  <h2 className="text-2xl font-extrabold text-stone-900 mb-1">Where are you based?</h2>
                  <p className="text-stone-500 text-sm mb-7">We&apos;ll show you results near your location.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="text"
                          placeholder="e.g. Bengaluru, Mumbai, Delhi"
                          value={location.city}
                          onChange={(e) => setLocation({ ...location, city: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">State</label>
                        <select
                          value={location.state}
                          onChange={(e) => setLocation({ ...location, state: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white text-stone-700"
                        >
                          <option value="">Select state</option>
                          {["Andhra Pradesh","Delhi","Gujarat","Karnataka","Kerala","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Pincode</label>
                        <input
                          type="text"
                          placeholder="560001"
                          maxLength={6}
                          value={location.pincode}
                          onChange={(e) => setLocation({ ...location, pincode: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Role-specific details */}
              {step === 3 && (
                <div>
                  <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">Your Profile</p>
                  <h2 className="text-2xl font-extrabold text-stone-900 mb-1">
                    {role === "homeowner" ? "Tell us about your project" :
                     role === "contractor" ? "About your business" :
                     role === "labour" ? "Your trade & experience" : "Your business details"}
                  </h2>
                  <p className="text-stone-500 text-sm mb-7">This helps us match you with the right people.</p>

                  {role === "homeowner" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Project type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["New Build", "Renovation", "Interior Work", "Repair / Fix", "Addition / Floor", "Other"].map((t) => (
                            <button key={t} onClick={() => setProfile({ ...profile, projectType: t })}
                              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-center ${profile.projectType === t ? "border-orange-500 bg-orange-50 text-orange-600" : "border-stone-200 text-stone-600 hover:border-orange-200"}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Estimated budget</label>
                        <select value={profile.budget} onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-stone-700">
                          <option value="">Select range</option>
                          <option>Under ₹5 Lakh</option>
                          <option>₹5 – 15 Lakh</option>
                          <option>₹15 – 30 Lakh</option>
                          <option>₹30 – 60 Lakh</option>
                          <option>₹60 Lakh – 1 Cr</option>
                          <option>Above ₹1 Cr</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Timeline</label>
                        <select value={profile.timeline} onChange={(e) => setProfile({ ...profile, timeline: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-stone-700">
                          <option value="">When do you want to start?</option>
                          <option>Immediately</option>
                          <option>Within 1 month</option>
                          <option>1–3 months</option>
                          <option>3–6 months</option>
                          <option>6+ months (planning)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(role === "contractor" || role === "supplier") && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Business name</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input type="text" placeholder="Your business name" value={profile.businessName}
                            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Years of experience</label>
                        <select value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-stone-700">
                          <option value="">Select experience</option>
                          <option>Less than 2 years</option>
                          <option>2–5 years</option>
                          <option>5–10 years</option>
                          <option>10–20 years</option>
                          <option>20+ years</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {role === "labour" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Your primary trade</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Mason / Mistri", "Electrician", "Plumber", "Carpenter", "Painter", "Tiler", "Welder", "Helper"].map((t) => (
                            <button key={t} onClick={() => setProfile({ ...profile, trade: t })}
                              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left ${profile.trade === t ? "border-orange-500 bg-orange-50 text-orange-600" : "border-stone-200 text-stone-600 hover:border-orange-200"}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Experience</label>
                        <select value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-stone-700">
                          <option value="">Select experience</option>
                          <option>Less than 1 year</option>
                          <option>1–3 years</option>
                          <option>3–7 years</option>
                          <option>7–15 years</option>
                          <option>15+ years</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4 — Interests / preferences */}
              {step === 4 && (
                <div>
                  <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">Preferences</p>
                  <h2 className="text-2xl font-extrabold text-stone-900 mb-1">What are you looking for?</h2>
                  <p className="text-stone-500 text-sm mb-7">Select all that apply. We&apos;ll show you relevant results first.</p>
                  <div className="flex flex-wrap gap-2.5">
                    {(role === "homeowner"
                      ? ["Sand & Aggregate", "Bricks & Blocks", "Cement", "Steel / TMT", "Wood & Timber", "Tiles & Flooring", "Paint", "Glass & Windows", "Civil Contractor", "Structural Engineer", "Electrician", "Plumber", "Carpenter", "Painter", "Interior Designer", "Architect"]
                      : role === "contractor" || role === "labour"
                      ? ["Residential", "Commercial", "Renovation", "New Construction", "Interior Work", "Electrical", "Plumbing", "Painting", "Waterproofing", "Landscaping"]
                      : ["Sand", "Bricks", "Cement", "Steel", "Wood", "Tiles", "Paint", "Electrical Supplies", "Plumbing Supplies", "Hardware"]
                    ).map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleInterest(item)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          interests.includes(item)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {interests.length > 0 && (
                    <p className="mt-4 text-sm text-stone-500">{interests.length} selected</p>
                  )}
                </div>
              )}

              {/* Step 5 — Done */}
              {step === TOTAL_STEPS && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-stone-900 mb-2">You&apos;re all set! 🎉</h2>
                  <p className="text-stone-500 mb-2">
                    Your Griffy account is ready.{" "}
                    {role === "homeowner"
                      ? "Start browsing materials, contractors and labour near you."
                      : role === "contractor"
                      ? "Complete your profile to start receiving project leads."
                      : role === "labour"
                      ? "Set your availability and start getting booked."
                      : "List your first product and reach 1,20,000+ homeowners."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <Link href="/feed" className="btn-primary px-8 py-3">
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/profile" className="btn-secondary px-8 py-3">
                      <User className="w-4 h-4" /> Complete Profile
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-sm text-stone-500 ml-2">Join 1,20,000+ happy users</span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {step < TOTAL_STEPS && (
                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={prev}
                    disabled={step === 1}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={next}
                    className="btn-primary px-8 py-2.5"
                  >
                    {step === TOTAL_STEPS - 1 ? "Finish" : "Continue"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step dots */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div key={i} className={`rounded-full transition-all ${i + 1 === step ? "w-6 h-2 bg-orange-500" : "w-2 h-2 bg-stone-200"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
