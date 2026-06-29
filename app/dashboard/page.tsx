"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package, Users, Wrench, IndianRupee, TrendingUp, Bell, ChevronRight,
  Star, Plus, Clock, CheckCircle2, Truck, LayoutDashboard,
} from "lucide-react";

const stats = [
  { label: "Active Orders", value: "3", change: "+1 this week", icon: Package, color: "bg-blue-50 text-blue-600", trend: "up" },
  { label: "Total Spent", value: "₹1.23L", change: "This month", icon: IndianRupee, color: "bg-green-50 text-green-600", trend: "up" },
  { label: "Saved Items", value: "12", change: "Materials & services", icon: Star, color: "bg-yellow-50 text-yellow-600", trend: "neutral" },
  { label: "Projects Posted", value: "2", change: "8 quotes received", icon: TrendingUp, color: "bg-orange-50 text-orange-600", trend: "up" },
];

const recentOrders = [
  { id: "GRF847291", item: "Red Clay Bricks + M-Sand", emoji: "🧱", status: "in_transit", date: "24 Jun", amount: 10300 },
  { id: "GRF712843", item: "TMT Steel Bars (Fe500D)", emoji: "🏗️", status: "delivered", date: "18 Jun", amount: 28000 },
  { id: "GRF603921", item: "Civil Contractor — Rajan Constructions", emoji: "👷", status: "pending", date: "10 Jun", amount: 180000 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700" },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700" },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700" },
};

const quickActions = [
  { label: "Buy Materials", href: "/materials", emoji: "🧱", desc: "Sand, cement, steel & more" },
  { label: "Hire Contractor", href: "/contractors", emoji: "👷", desc: "Civil, electrical, plumbing" },
  { label: "Hire Labour", href: "/labour", emoji: "🔧", desc: "Mistri, tiler, painter & more" },
  { label: "Post a Project", href: "/post-project", emoji: "📋", desc: "Get quotes from contractors" },
];

const notifications = [
  { text: "Your order GRF847291 is out for delivery", time: "2 hours ago", icon: Truck, unread: true },
  { text: "New quote received for '3BHK Construction'", time: "5 hours ago", icon: Users, unread: true },
  { text: "Order GRF712843 has been delivered", time: "Yesterday", icon: CheckCircle2, unread: false },
  { text: "Mohammed Aslam accepted your booking request", time: "2 days ago", icon: Wrench, unread: false },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "notifications">("overview");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-lg flex items-center justify-center">R</div>
                <div>
                  <h1 className="text-xl font-extrabold text-stone-900">Welcome back, Rajesh 👋</h1>
                  <p className="text-sm text-stone-500">Homeowner · HSR Layout, Bengaluru</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/post-project" className="btn-primary text-sm py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Post a Project
              </Link>
              <Link href="/profile" className="btn-secondary text-sm py-2">
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-stone-100 p-1 rounded-xl w-fit">
            {(["overview", "orders", "notifications"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
              >
                {t}
                {t === "notifications" && <span className="ml-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full inline-flex items-center justify-center">2</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-extrabold text-stone-900">{s.value}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{s.label}</p>
                    <p className="text-xs text-stone-400 mt-1">{s.change}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((qa) => (
                  <Link key={qa.href} href={qa.href} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
                    <span className="text-3xl mb-3 block">{qa.emoji}</span>
                    <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">{qa.label}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{qa.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-stone-900 text-lg">Recent Orders</h2>
                <Link href="/orders" className="text-sm text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const sc = STATUS_CONFIG[order.status];
                  return (
                    <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4 hover:border-orange-200 transition-all group">
                      <span className="text-2xl">{order.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 text-sm truncate">{order.item}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{order.id} · {order.date}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                        <span className="font-bold text-stone-900 text-sm">₹{order.amount.toLocaleString("en-IN")}</span>
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Project Progress */}
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg mb-4">Active Projects</h2>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-stone-900">3BHK Home Construction</h3>
                    <p className="text-sm text-stone-500">HSR Layout, Bengaluru · Started Jun 5, 2025</p>
                  </div>
                  <span className="badge bg-blue-100 text-blue-700 text-xs">In Progress</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Foundation", pct: 100, done: true },
                    { label: "Brick Masonry", pct: 75, done: false },
                    { label: "Roofing", pct: 0, done: false },
                    { label: "Interiors", pct: 0, done: false },
                  ].map((phase) => (
                    <div key={phase.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-medium ${phase.done ? "text-green-600" : phase.pct > 0 ? "text-stone-900" : "text-stone-400"}`}>
                          {phase.done && "✓ "}{phase.label}
                        </span>
                        <span className="text-stone-400 text-xs">{phase.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${phase.done ? "bg-green-400" : "bg-orange-400"}`}
                          style={{ width: `${phase.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-stone-900 text-lg">All Orders</h2>
            {recentOrders.map((order) => {
              const sc = STATUS_CONFIG[order.status];
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4 hover:border-orange-200 transition-all group">
                  <span className="text-3xl">{order.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{order.item}</p>
                    <p className="text-sm text-stone-400 mt-0.5">{order.id} · {order.date}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                    <span className="font-bold text-stone-900">₹{order.amount.toLocaleString("en-IN")}</span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400" />
                  </div>
                </Link>
              );
            })}
            <Link href="/orders" className="block text-center text-sm text-orange-500 hover:text-orange-600 font-semibold py-2">
              View full order history →
            </Link>
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <div className="space-y-3">
            <h2 className="font-extrabold text-stone-900 text-lg">Notifications</h2>
            {notifications.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-4 ${n.unread ? "border-orange-100" : "border-stone-100"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? "bg-orange-100 text-orange-600" : "bg-stone-100 text-stone-500"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${n.unread ? "font-semibold text-stone-900" : "text-stone-600"}`}>{n.text}</p>
                    <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {n.time}
                    </p>
                  </div>
                  {n.unread && <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
