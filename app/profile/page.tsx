"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Star, CheckCircle2, Edit2, Camera, Phone, Mail,
  Package, HardHat, Clock, ShieldCheck, Share2, Heart, MessageSquare,
  Calendar, Award, ChevronRight, Settings, Save, Loader2,
} from "lucide-react";
import { updateMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/constants";

const ROLE_LABELS: Record<string, string> = {
  homeowner: "🏠 Homeowner",
  contractor: "👷 Contractor",
  labour: "🔧 Labour",
  supplier: "🧱 Supplier",
  admin: "⚙️ Admin",
};

const tabs = ["About", "Reviews"] as const;
type Tab = typeof tabs[number];

const reviews = [
  { id: 1, author: "Rajesh Kumar", rating: 5, date: "Jun 2025", text: "Excellent platform. Found my civil contractor and all materials in one place.", avatar: "RK", avatarBg: "bg-blue-100 text-blue-600" },
  { id: 2, author: "Meena Sharma", rating: 5, date: "May 2025", text: "The mistri team I hired through Griffy was very professional.", avatar: "MS", avatarBg: "bg-pink-100 text-pink-600" },
];

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("About");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
      });
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      await updateMe(form);
      await refresh();
      setEditing(false);
    } catch (e: any) {
      setSaveError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const ini = initials(user.fullName);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <span className="absolute top-6 right-12 text-5xl opacity-20">🏗️</span>
          <span className="absolute bottom-4 left-20 text-4xl opacity-15">🔨</span>
          <span className="absolute top-4 left-8 text-3xl opacity-15">🧱</span>
        </div>

        <div className="absolute -bottom-16 left-6 md:left-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-4xl font-extrabold text-white">{ini}</span>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white" title="Active" />
          </div>
        </div>

        <div className="absolute bottom-4 right-4 md:right-8 flex items-center gap-2">
          <Link href="/settings" className="p-2 bg-white rounded-xl shadow-md text-stone-600 hover:text-stone-800 border border-stone-100 transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
          {editing ? (
            <div className="flex items-center gap-2">
              {saveError && <span className="text-xs text-red-500 bg-white px-2 py-1 rounded-lg">{saveError}</span>}
              <button
                onClick={() => { setEditing(false); setSaveError(""); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-stone-700 border border-stone-200 shadow-md hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-green-500 hover:bg-green-600 text-white shadow-md transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-md transition-all"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            {editing ? (
              <input
                className="text-2xl font-extrabold text-stone-900 border-b-2 border-orange-400 outline-none bg-transparent mb-1 w-64"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900">{user.fullName}</h1>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-stone-500 text-sm">
              <span className="font-semibold text-orange-500">{roleLabel}</span>
              {(form.city || form.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {editing ? (
                    <span className="flex gap-1">
                      <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="City" className="border-b border-stone-300 outline-none bg-transparent w-20 text-stone-800 focus:border-orange-400" />
                      <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                        placeholder="State" className="border-b border-stone-300 outline-none bg-transparent w-20 text-stone-800 focus:border-orange-400" />
                    </span>
                  ) : (
                    [form.city, form.state].filter(Boolean).join(", ")
                  )}
                </span>
              )}
              {!(form.city || form.state) && editing && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City" className="border-b border-stone-300 outline-none bg-transparent w-20 text-stone-800 focus:border-orange-400" />
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="State" className="border-b border-stone-300 outline-none bg-transparent w-20 text-stone-800 focus:border-orange-400" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {user.isVerified && (
                <span className="flex items-center gap-1 badge bg-green-100 text-green-700 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                </span>
              )}
              <span className="flex items-center gap-1 badge bg-blue-100 text-blue-700 text-xs">
                <Star className="w-3.5 h-3.5 fill-blue-500" /> Trusted Member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 border-b border-stone-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">

            {/* About */}
            {activeTab === "About" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Account Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Role", value: roleLabel, icon: HardHat },
                      { label: "Location", value: [form.city, form.state].filter(Boolean).join(", ") || "Not set", icon: MapPin },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-400">{item.label}</p>
                          <p className="font-semibold text-stone-800 text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile strength */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Profile Strength</h3>
                  {(() => {
                    const checks = [
                      { label: "Name", done: !!user.fullName },
                      { label: "Email", done: !!user.email },
                      { label: "Phone", done: !!user.phone },
                      { label: "Location", done: !!(user.city || user.state) },
                      { label: "ID Verified", done: user.isVerified },
                    ];
                    const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
                    return (
                      <>
                        <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                          <span>{pct}% complete</span>
                          <span className={pct >= 80 ? "text-green-500 font-semibold" : pct >= 50 ? "text-orange-500 font-semibold" : "text-stone-400"}>{pct >= 80 ? "Strong" : pct >= 50 ? "Good" : "Incomplete"}</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2.5 mb-4">
                          <div className={`h-2.5 rounded-full transition-all ${pct >= 80 ? "bg-green-500" : "bg-orange-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="space-y-2">
                          {checks.map((item) => (
                            <div key={item.label} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? "text-green-500" : "text-stone-200"}`} />
                              <span className={item.done ? "text-stone-700" : "text-stone-400"}>{item.label}</span>
                              {!item.done && <span className="text-xs text-orange-400 ml-auto">Missing</span>}
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === "Reviews" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-5xl font-extrabold text-stone-900">4.8</p>
                      <div className="flex items-center gap-0.5 justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-stone-500 text-xs mt-1">{reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter((r) => r.rating === star).length;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-stone-500 w-4">{star}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 bg-stone-100 rounded-full h-1.5">
                              <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${(count / reviews.length) * 100}%` }} />
                            </div>
                            <span className="text-xs text-stone-400 w-4">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${r.avatarBg} font-bold text-sm flex items-center justify-center`}>{r.avatar}</div>
                        <div>
                          <p className="font-semibold text-stone-900">{r.author}</p>
                          <p className="text-xs text-stone-400">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-5">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-stone-400">Email</p>
                    <p className="text-sm font-medium text-stone-800 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-stone-400">Phone</p>
                    {editing ? (
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="text-sm font-medium text-stone-800 border-b border-stone-200 outline-none focus:border-orange-400 bg-transparent w-full" />
                    ) : (
                      <p className="text-sm font-medium text-stone-800">{user.phone || <span className="text-stone-400 italic">Not set</span>}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { label: "My Orders", href: "/orders", icon: Package },
                  { label: "Dashboard", href: "/dashboard", icon: HardHat },
                  { label: "Account Settings", href: "/settings", icon: Settings },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-stone-50 text-stone-600 hover:text-orange-500 transition-colors">
                    <l.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{l.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
