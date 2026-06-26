"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, Star, CheckCircle2, Edit2, Camera, Phone, Mail,
  Package, HardHat, Clock, ShieldCheck, Share2, Heart, MessageSquare,
  Calendar, Award, ChevronRight, Settings
} from "lucide-react";

const tabs = ["About", "Activity", "Reviews"] as const;
type Tab = typeof tabs[number];

const reviews = [
  { id: 1, author: "Rajesh Kumar", rating: 5, date: "Jun 2025", text: "Excellent platform. Found my civil contractor and all materials in one place. Saved so much time!", avatar: "RK", avatarBg: "bg-blue-100 text-blue-600" },
  { id: 2, author: "Meena Sharma", rating: 5, date: "May 2025", text: "The mistri team I hired through Griffy was very professional. Would definitely recommend.", avatar: "MS", avatarBg: "bg-pink-100 text-pink-600" },
  { id: 3, author: "Anil Patel", rating: 4, date: "Apr 2025", text: "Good prices on materials. Delivery was a day late but quality was excellent.", avatar: "AP", avatarBg: "bg-green-100 text-green-600" },
];

const activityFeed = [
  { emoji: "🧱", text: "Ordered Red Bricks × 2000 pcs", time: "Jun 15, 2025", status: "Delivered", statusColor: "text-green-600" },
  { emoji: "🔨", text: "Booked Rajan Constructions for civil work", time: "Jun 10, 2025", status: "In Progress", statusColor: "text-orange-600" },
  { emoji: "🏖️", text: "Ordered River Sand × 10 tons", time: "Jun 18, 2025", status: "In Transit", statusColor: "text-blue-600" },
  { emoji: "⚡", text: "Hired Sanjay — Electrician for 3 days", time: "May 28, 2025", status: "Completed", statusColor: "text-green-600" },
  { emoji: "⭐", text: "Left a review for Rajan Constructions", time: "May 20, 2025", status: "Posted", statusColor: "text-yellow-600" },
];

const savedItems = [
  { emoji: "🏗️", name: "UltraTech OPC 53 Cement", sub: "₹420/bag · UltraTech Dealer", type: "Material" },
  { emoji: "🔩", name: "JSW TMT Fe500 — 12mm", sub: "₹68,000/ton · JSW Distributor", type: "Material" },
  { emoji: "🔨", name: "Mehta & Associates", sub: "Structural Engineer · Mumbai", type: "Contractor" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("About");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Arun Raina",
    role: "Homeowner",
    city: "Bengaluru",
    state: "Karnataka",
    phone: "+91 98765 43210",
    email: "arun@example.com",
    bio: "Building my dream home in North Bengaluru. Passionate about quality construction and using the best materials.",
    projectType: "New Build",
    budget: "₹30 – 60 Lakh",
    timeline: "Started Jun 2025",
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Cover + Avatar */}
      <div className="relative">
        {/* Cover image */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          {/* Construction icons floating */}
          <span className="absolute top-6 right-12 text-5xl opacity-20">🏗️</span>
          <span className="absolute bottom-4 left-20 text-4xl opacity-15">🔨</span>
          <span className="absolute top-4 left-8 text-3xl opacity-15">🧱</span>
          <button className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors">
            <Camera className="w-3.5 h-3.5" /> Change Cover
          </button>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-16 left-6 md:left-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-4xl font-extrabold text-white">AR</span>
              </div>
            </div>
            <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-colors">
              <Camera className="w-4 h-4" />
            </button>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white" title="Active" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 md:right-8 flex items-center gap-2">
          <button className="p-2 bg-white rounded-xl shadow-md text-stone-600 hover:text-stone-800 border border-stone-100 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <Link href="/settings" className="p-2 bg-white rounded-xl shadow-md text-stone-600 hover:text-stone-800 border border-stone-100 transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${editing ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white hover:bg-stone-50 text-stone-800 border border-stone-200"}`}
          >
            <Edit2 className="w-4 h-4" />
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            {editing ? (
              <input
                className="text-2xl font-extrabold text-stone-900 border-b-2 border-orange-400 outline-none bg-transparent mb-1"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900">{profile.name}</h1>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-stone-500 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-orange-500">🏠 {profile.role}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.city}, {profile.state}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined Jan 2024</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="flex items-center gap-1 badge bg-green-100 text-green-700 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
              </span>
              <span className="flex items-center gap-1 badge bg-blue-100 text-blue-700 text-xs">
                <Star className="w-3.5 h-3.5 fill-blue-500" /> Trusted Member
              </span>
              <span className="flex items-center gap-1 badge bg-orange-100 text-orange-700 text-xs">
                <Award className="w-3.5 h-3.5" /> Top Reviewer
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5 md:gap-8">
            {[
              { label: "Orders", value: "7", icon: Package, color: "text-orange-500" },
              { label: "Reviews", value: "5", icon: Star, color: "text-yellow-500" },
              { label: "Saved", value: "12", icon: Heart, color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className="text-xl font-extrabold text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </div>
            ))}
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
                activeTab === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-stone-500 hover:text-stone-700"
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
                  <h3 className="font-bold text-stone-900 mb-3">Bio</h3>
                  {editing ? (
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                    />
                  ) : (
                    <p className="text-stone-600 leading-relaxed">{profile.bio}</p>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Project Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Project Type", value: profile.projectType, icon: HardHat },
                      { label: "Budget", value: profile.budget, icon: Package },
                      { label: "Timeline", value: profile.timeline, icon: Clock },
                      { label: "Location", value: `${profile.city}, ${profile.state}`, icon: MapPin },
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

                {/* Saved items */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-stone-900">Saved Items</h3>
                    <Link href="/saved" className="text-sm text-orange-500 hover:text-orange-600 font-medium">View all</Link>
                  </div>
                  <div className="space-y-3">
                    {savedItems.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">{item.name}</p>
                          <p className="text-xs text-stone-500">{item.sub}</p>
                        </div>
                        <span className="badge bg-stone-200 text-stone-600 text-xs">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity */}
            {activeTab === "Activity" && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h3 className="font-bold text-stone-900 mb-5">Recent Activity</h3>
                <div className="space-y-4">
                  {activityFeed.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-xl shrink-0">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800 text-sm font-medium">{item.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-stone-400">{item.time}</span>
                          <span className={`text-xs font-semibold ${item.statusColor}`}>{item.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <div className="min-w-0">
                    <p className="text-xs text-stone-400">Email</p>
                    {editing ? (
                      <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="text-sm font-medium text-stone-800 border-b border-stone-200 outline-none focus:border-orange-400 bg-transparent w-full" />
                    ) : (
                      <p className="text-sm font-medium text-stone-800 truncate">{profile.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Phone</p>
                    {editing ? (
                      <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="text-sm font-medium text-stone-800 border-b border-stone-200 outline-none focus:border-orange-400 bg-transparent" />
                    ) : (
                      <p className="text-sm font-medium text-stone-800">{profile.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Completion */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3">Profile Strength</h3>
              <div className="relative mb-3">
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>75% complete</span>
                  <span className="text-orange-500 font-semibold">Strong</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Basic Info", done: true },
                  { label: "Contact Details", done: true },
                  { label: "Project Details", done: true },
                  { label: "Profile Photo", done: false },
                  { label: "ID Verification", done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? "text-green-500" : "text-stone-200"}`} />
                    <span className={item.done ? "text-stone-700" : "text-stone-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { label: "My Orders", href: "/orders", icon: Package },
                  { label: "My Bookings", href: "/bookings", icon: HardHat },
                  { label: "Saved Items", href: "/saved", icon: Heart },
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
