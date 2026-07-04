"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, IndianRupee, TrendingUp, ChevronRight, Star,
  Plus, Clock, CheckCircle2, Truck, XCircle, AlertCircle,
  Briefcase, Wrench, LayoutGrid, Users, Edit2, ToggleLeft,
  ToggleRight, Loader2,
} from "lucide-react";
import {
  listMyOrders, listIncomingOrders, updateOrderStatus,
  getMyContractorProfile, getMyLabourProfile, listMyMaterials,
  Order, Contractor, Labour, Material,
} from "@/lib/api";
import { ORDER_STATUS, formatDate, initials, SPECIALTY_LABEL, TRADE_LABEL, TRADE_EMOJI, CATEGORY_EMOJI, CATEGORY_LABEL } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

const quickActionsHomeowner = [
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
  disputed: AlertCircle,
};

// ── Homeowner dashboard ────────────────────────────────────────────────────

function HomeownerDashboard({ user, orders, ordersLoading }: { user: any; orders: Order[]; ordersLoading: boolean }) {
  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const activeOrders = orders.filter((o) => ["pending", "accepted", "in_progress"].includes(o.status));

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Package} color="blue" label="Active Orders" value={ordersLoading ? "—" : activeOrders.length} />
        <StatCard icon={IndianRupee} color="green" label="Total Spent"
          value={ordersLoading ? "—" : totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : `₹${totalSpent.toLocaleString("en-IN")}`} />
        <StatCard icon={TrendingUp} color="orange" label="Total Orders" value={ordersLoading ? "—" : orders.length} />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-extrabold text-stone-900 text-lg mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActionsHomeowner.map((qa) => (
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
        <OrderList orders={orders} loading={ordersLoading} emptyText="No orders yet. Start by browsing materials or hiring a contractor." limit={5} />
      </div>
    </div>
  );
}

// ── Pro dashboard (contractor / labour / supplier) ─────────────────────────

type ProTab = "overview" | "bookings" | "listings";

function ProDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<ProTab>("overview");
  const [incoming, setIncoming] = useState<(Order & { buyer?: any })[]>([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [profile, setProfile] = useState<Contractor | Labour | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isContractor = user.role === "contractor";
  const isLabour = user.role === "labour";
  const isSupplier = user.role === "supplier";

  const listingsLabel = isSupplier ? "My Materials" : "My Profile";
  const listingsTab: ProTab = "listings";

  useEffect(() => {
    listIncomingOrders(1, 20)
      .then((r) => setIncoming(r.data))
      .catch(() => {})
      .finally(() => setIncomingLoading(false));

    if (isContractor) {
      getMyContractorProfile().then(setProfile).catch(() => {});
    } else if (isLabour) {
      getMyLabourProfile().then(setProfile).catch(() => {});
    } else if (isSupplier) {
      setMaterialsLoading(true);
      listMyMaterials(1, 50).then((r) => setMaterials(r.data)).catch(() => {}).finally(() => setMaterialsLoading(false));
    }
  }, [isContractor, isLabour, isSupplier]);

  async function changeStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setIncoming((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    } catch {
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = incoming.filter((o) => o.status === "pending").length;
  const activeCount = incoming.filter((o) => ["accepted", "in_progress"].includes(o.status)).length;
  const completedCount = incoming.filter((o) => o.status === "completed").length;
  const earnings = incoming.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0);

  const tabs: { id: ProTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: `Bookings${incoming.length > 0 ? ` (${incoming.length})` : ""}` },
    { id: listingsTab, label: listingsLabel },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-8 bg-stone-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Clock} color="amber" label="Pending" value={incomingLoading ? "—" : pendingCount} />
            <StatCard icon={Truck} color="blue" label="Active" value={incomingLoading ? "—" : activeCount} />
            <StatCard icon={CheckCircle2} color="green" label="Completed" value={incomingLoading ? "—" : completedCount} />
            <StatCard icon={IndianRupee} color="orange" label="Earnings"
              value={incomingLoading ? "—" : earnings >= 100000 ? `₹${(earnings / 100000).toFixed(1)}L` : `₹${earnings.toLocaleString("en-IN")}`} />
          </div>

          {/* Profile card */}
          {(isContractor || isLabour) && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-stone-900 text-lg">My Profile</h2>
                <Link href="/profile" className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
                  <Edit2 className="w-4 h-4" /> Edit
                </Link>
              </div>
              {profile ? (
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">
                    {isLabour ? (TRADE_EMOJI[(profile as Labour).trade] ?? "🛠️") : "👷"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-stone-900">
                        {isContractor ? (profile as Contractor).businessName : user.fullName}
                      </h3>
                      {(profile as any).isVerified && (
                        <span className="badge bg-blue-100 text-blue-700 text-xs">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-stone-500 text-sm mt-0.5">
                      {isContractor ? SPECIALTY_LABEL[(profile as Contractor).specialty] ?? (profile as Contractor).specialty
                        : TRADE_LABEL[(profile as Labour).trade] ?? (profile as Labour).trade}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-600">
                      {(profile as any).rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          {(profile as any).rating.toFixed(1)}
                        </span>
                      )}
                      {(profile as any).city && <span>{(profile as any).city}{(profile as any).state ? `, ${(profile as any).state}` : ""}</span>}
                      <span className={`font-semibold ${(profile as any).isAvailable ? "text-green-600" : "text-stone-400"}`}>
                        {(profile as any).isAvailable ? "● Available" : "● Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-stone-500 text-sm mb-3">No profile created yet.</p>
                  <p className="text-xs text-stone-400">
                    {isContractor ? "Create your contractor profile to start receiving bookings." : "Create your labour profile to start getting hired."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick actions for pro */}
          <div>
            <h2 className="font-extrabold text-stone-900 text-lg mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {isSupplier && (
                <Link href="/materials" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
                  <span className="text-3xl mb-3 block">🧱</span>
                  <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">Browse Marketplace</p>
                  <p className="text-sm text-stone-500 mt-0.5">See how your products compare</p>
                </Link>
              )}
              <Link href="/profile" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
                <span className="text-3xl mb-3 block">👤</span>
                <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">Edit Profile</p>
                <p className="text-sm text-stone-500 mt-0.5">Update your info & location</p>
              </Link>
              <button
                onClick={() => setActiveTab("bookings")}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group text-left"
              >
                <span className="text-3xl mb-3 block">📋</span>
                <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">View Bookings</p>
                <p className="text-sm text-stone-500 mt-0.5">{pendingCount > 0 ? `${pendingCount} pending` : "No pending requests"}</p>
              </button>
              <Link href={isContractor ? "/contractors" : isLabour ? "/labour" : "/materials"} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
                <span className="text-3xl mb-3 block">🔍</span>
                <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">View Marketplace</p>
                <p className="text-sm text-stone-500 mt-0.5">See your public listing</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-stone-900 text-lg">Incoming Bookings</h2>
          {incomingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse h-20" />
              ))}
            </div>
          ) : incoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No bookings yet. Complete your profile to attract customers.</p>
            </div>
          ) : (
            incoming.map((order) => {
              const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
              const Icon = STATUS_ICONS[order.status] ?? Clock;
              const isPending = order.status === "pending";
              const isActive = order.status === "in_progress";
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-stone-800">
                          {order.buyer?.fullName ?? "Customer"}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                          <Icon className="w-3 h-3" /> {sc.label}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 mt-0.5">
                        #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                      </p>
                      {order.notes && <p className="text-sm text-stone-600 mt-1 italic">"{order.notes}"</p>}
                      {order.deliveryAddress && (
                        <p className="text-xs text-stone-400 mt-1">📍 {order.deliveryAddress}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-stone-900">₹{Number(order.amount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {(isPending || isActive) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-stone-50 flex-wrap">
                      {isPending && (
                        <>
                          <button
                            onClick={() => changeStatus(order.id, "accepted")}
                            disabled={updatingId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                          >
                            {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Accept
                          </button>
                          <button
                            onClick={() => changeStatus(order.id, "cancelled")}
                            disabled={updatingId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </>
                      )}
                      {isActive && (
                        <button
                          onClick={() => changeStatus(order.id, "completed")}
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                        >
                          {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Mark Complete
                        </button>
                      )}
                      {order.status === "accepted" && (
                        <button
                          onClick={() => changeStatus(order.id, "in_progress")}
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                        >
                          {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                          Start Work
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Listings tab */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-stone-900 text-lg">{listingsLabel}</h2>
            {isSupplier && (
              <Link href="/materials" className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
                <Plus className="w-4 h-4" /> Browse all
              </Link>
            )}
          </div>

          {isSupplier && (
            materialsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse h-16" />
                ))}
              </div>
            ) : materials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">No materials listed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((m) => {
                  const emoji = CATEGORY_EMOJI[m.category] ?? "📦";
                  return (
                    <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4">
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                        <p className="text-xs text-stone-500">{CATEGORY_LABEL[m.category]} · ₹{Number(m.pricePerUnit).toLocaleString("en-IN")}/{m.unit}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                          {m.isAvailable ? "In Stock" : "Unavailable"}
                        </span>
                        <Link href={`/materials/${m.id}`} className="text-xs text-orange-500 font-semibold hover:text-orange-600">
                          View →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {(isContractor || isLabour) && profile && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                {(profile as any).bio ?? "No bio added yet."}
              </p>
              {(profile as any).skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(profile as any).skills.map((s: string) => (
                    <span key={s} className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full">{s}</span>
                  ))}
                </div>
              )}
              <Link href={isContractor ? `/contractors/${profile.id}` : `/labour/${profile.id}`}
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-orange-500 hover:text-orange-600 font-semibold">
                View public profile <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {(isContractor || isLabour) && !profile && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <Wrench className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 mb-2">No profile created yet.</p>
              <p className="text-stone-400 text-sm">Contact support to set up your professional profile.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────

function StatCard({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string | number }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-extrabold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}

function OrderList({ orders, loading, emptyText, limit }: { orders: Order[]; loading: boolean; emptyText: string; limit?: number }) {
  const shown = limit ? orders.slice(0, limit) : orders;
  if (loading) {
    return (
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
    );
  }
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
        <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500 text-sm">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {shown.map((order) => {
        const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
        const Icon = STATUS_ICONS[order.status] ?? Clock;
        const emoji = order.type === "material" ? "📦" : order.type === "contractor" ? "👷" : "🔧";
        return (
          <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4 hover:border-orange-200 transition-all group">
            <span className="text-2xl">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm capitalize">{order.type} order</p>
              <p className="text-xs text-stone-400 mt-0.5">#{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                <Icon className="w-3 h-3" /> {sc.label}
              </span>
              <span className="font-bold text-stone-900 text-sm">₹{Number(order.amount).toLocaleString("en-IN")}</span>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const isHomeowner = !user || user.role === "homeowner" || user.role === "admin";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    listMyOrders(1, 10)
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-lg flex items-center justify-center">
                {initials(user.fullName)}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-stone-900">Welcome back, {user.fullName.split(" ")[0]} 👋</h1>
                <p className="text-sm text-stone-500 capitalize">{user.role}{user.city ? ` · ${user.city}${user.state ? ", " + user.state : ""}` : ""}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isHomeowner && (
                <Link href="/post-project" className="btn-primary text-sm py-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Post a Project
                </Link>
              )}
              <Link href="/profile" className="btn-secondary text-sm py-2">Edit Profile</Link>
            </div>
          </div>

          {/* Tabs — homeowner only */}
          {isHomeowner && (
            <div className="flex gap-1 mt-5 bg-stone-100 p-1 rounded-xl w-fit">
              {(["overview", "orders"] as const).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isHomeowner ? (
          <>
            {activeTab === "overview" && <HomeownerDashboard user={user} orders={orders} ordersLoading={ordersLoading} />}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-stone-900 text-lg">All Orders</h2>
                <OrderList orders={orders} loading={ordersLoading} emptyText="No orders found." />
                <Link href="/orders" className="block text-center text-sm text-orange-500 hover:text-orange-600 font-semibold py-2">
                  View full order history →
                </Link>
              </div>
            )}
          </>
        ) : (
          <ProDashboard user={user} />
        )}
      </div>
    </div>
  );
}
