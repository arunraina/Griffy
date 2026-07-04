"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, IndianRupee, TrendingUp, ChevronRight,
  Star, Plus, Clock, CheckCircle2, Truck, XCircle,
} from "lucide-react";
import { listMyOrders, Order } from "@/lib/api";
import { ORDER_STATUS, formatDate, initials } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

const quickActions = [
  { label: "Buy Materials", href: "/materials", emoji: "🧱", desc: "Sand, cement, steel & more" },
  { label: "Hire Contractor", href: "/contractors", emoji: "👷", desc: "Civil, electrical, plumbing" },
  { label: "Hire Labour", href: "/labour", emoji: "🔧", desc: "Mistri, tiler, painter & more" },
  { label: "Post a Project", href: "/post-project", emoji: "📋", desc: "Get quotes from contractors" },
];

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  accepted: CheckCircle2,
  in_progress: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const res = await listMyOrders(1, 10);
        setOrders(res.data);
      } catch {
      } finally {
        setOrdersLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const activeOrders = orders.filter((o) => ["pending", "accepted", "in_progress"].includes(o.status));

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-lg flex items-center justify-center">
                  {initials(user.fullName)}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-stone-900">Welcome back, {user.fullName.split(" ")[0]} 👋</h1>
                  <p className="text-sm text-stone-500 capitalize">{user.role}{user.city ? ` · ${user.city}${user.state ? ", " + user.state : ""}` : ""}</p>
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
            {(["overview", "orders"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
              >
                {t}
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-stone-900">{ordersLoading ? "—" : activeOrders.length}</p>
                <p className="text-sm text-stone-500 mt-0.5">Active Orders</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-stone-900">
                  {ordersLoading ? "—" : totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : `₹${totalSpent.toLocaleString("en-IN")}`}
                </p>
                <p className="text-sm text-stone-500 mt-0.5">Total Spent</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-stone-900">{ordersLoading ? "—" : orders.length}</p>
                <p className="text-sm text-stone-500 mt-0.5">Total Orders</p>
              </div>
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

              {ordersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-stone-200 rounded w-1/2" />
                          <div className="h-3 bg-stone-200 rounded w-1/3" />
                        </div>
                        <div className="h-5 bg-stone-200 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
                  <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm">No orders yet. Start by browsing materials or hiring a contractor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => {
                    const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
                    const Icon = STATUS_ICONS[order.status] ?? Clock;
                    const emoji = order.type === "material" ? "📦" : order.type === "contractor" ? "👷" : "🔧";
                    return (
                      <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4 hover:border-orange-200 transition-all group">
                        <span className="text-2xl">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">
                            {order.type.charAt(0).toUpperCase() + order.type.slice(1)} order
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">#{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                            <Icon className="w-3 h-3" /> {sc.label}
                          </span>
                          <span className="font-bold text-stone-900 text-sm">₹{order.amount.toLocaleString("en-IN")}</span>
                          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-stone-900 text-lg">All Orders</h2>
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse h-20" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 text-sm">No orders found.</p>
              </div>
            ) : (
              orders.map((order) => {
                const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
                const Icon = STATUS_ICONS[order.status] ?? Clock;
                const emoji = order.type === "material" ? "📦" : order.type === "contractor" ? "👷" : "🔧";
                return (
                  <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4 hover:border-orange-200 transition-all group">
                    <span className="text-3xl">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800">
                        {order.type.charAt(0).toUpperCase() + order.type.slice(1)} order
                      </p>
                      <p className="text-sm text-stone-400 mt-0.5">#{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                      <span className="font-bold text-stone-900">₹{order.amount.toLocaleString("en-IN")}</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400" />
                    </div>
                  </Link>
                );
              })
            )}
            <Link href="/orders" className="block text-center text-sm text-orange-500 hover:text-orange-600 font-semibold py-2">
              View full order history →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
