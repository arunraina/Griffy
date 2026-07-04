"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Package, ShoppingCart, Shield, Star, TrendingUp,
  CheckCircle2, XCircle, ToggleLeft, ToggleRight, Search,
  ChevronRight, IndianRupee, AlertTriangle,
} from "lucide-react";
import {
  adminGetStats, adminListUsers, adminUpdateUser,
  adminListContractors, adminVerifyContractor,
  adminListMaterials, adminToggleFeatured,
  adminListOrders,
  AdminStats, User, Contractor, Material, Order,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate, ORDER_STATUS } from "@/lib/constants";

type AdminTab = "overview" | "users" | "contractors" | "materials" | "orders";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
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

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorFilter, setContractorFilter] = useState<"all" | "pending">("pending");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<(Order & { buyer?: User })[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      adminGetStats().then(setStats).catch(() => {});
    }
  }, [isAuthenticated, user]);

  const loadTab = useCallback(async (tab: AdminTab) => {
    setLoading(true);
    try {
      if (tab === "users") {
        const r = await adminListUsers(1, 50, userSearch || undefined);
        setUsers(r.data);
      } else if (tab === "contractors") {
        const verified = contractorFilter === "pending" ? false : undefined;
        const r = await adminListContractors(1, 50, verified);
        setContractors(r.data);
      } else if (tab === "materials") {
        const r = await adminListMaterials(1, 50);
        setMaterials(r.data);
      } else if (tab === "orders") {
        const r = await adminListOrders(1, 50);
        setOrders(r.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [userSearch, contractorFilter]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin" && activeTab !== "overview") {
      loadTab(activeTab);
    }
  }, [activeTab, loadTab, isAuthenticated, user]);

  async function toggleActive(userId: string, current: boolean) {
    setTogglingId(userId);
    try {
      const updated = await adminUpdateUser(userId, { isActive: !current });
      if (updated) setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !current } : u)));
    } catch {
    } finally {
      setTogglingId(null);
    }
  }

  async function verifyContractor(id: string) {
    setTogglingId(id);
    try {
      const updated = await adminVerifyContractor(id);
      if (updated) setContractors((prev) => prev.map((c) => (c.id === id ? { ...c, isVerified: true } : c)));
    } catch {
    } finally {
      setTogglingId(null);
    }
  }

  async function toggleFeatured(id: string) {
    setTogglingId(id);
    try {
      const updated = await adminToggleFeatured(id);
      if (updated) setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, isFeatured: updated.isFeatured } : m)));
    } catch {
    } finally {
      setTogglingId(null);
    }
  }

  if (authLoading || !user) return null;
  if (user.role !== "admin") return null;

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "contractors", label: `Contractors${stats?.pendingVerifications ? ` (${stats.pendingVerifications})` : ""}` },
    { id: "materials", label: "Materials" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900">Admin Panel</h1>
              <p className="text-sm text-stone-500">Griffy platform management</p>
            </div>
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="blue" />
              <StatCard icon={Shield} label="Contractors" value={stats.totalContractors} color="green" />
              <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="orange" />
              <StatCard icon={AlertTriangle} label="Pending Verification" value={stats.pendingVerifications} color="amber" />
              <StatCard icon={IndianRupee} label="Platform Revenue" value={`₹${Number(stats.platformRevenue).toLocaleString("en-IN")}`} color="green" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "users", label: "Manage Users", desc: "View, activate/deactivate accounts", icon: Users, color: "blue" },
                { id: "contractors", label: "Verify Contractors", desc: `${stats.pendingVerifications} pending verifications`, icon: Shield, color: "amber" },
                { id: "materials", label: "Featured Materials", desc: "Toggle featured status on listings", icon: Package, color: "orange" },
              ].map((action) => (
                <button key={action.id} onClick={() => setActiveTab(action.id as AdminTab)}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-left hover:border-orange-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <action.icon className="w-5 h-5 text-stone-400 group-hover:text-orange-500 transition-colors" />
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{action.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 ml-auto group-hover:text-orange-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-extrabold text-stone-900 text-lg flex-1">Users</h2>
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text" placeholder="Search users…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadTab("users")}
                  className="text-sm outline-none text-stone-700 placeholder-stone-400 w-48"
                />
              </div>
              <button onClick={() => loadTab("users")} className="btn-primary text-sm py-2">Search</button>
            </div>
            {loading ? <p className="text-stone-400 text-sm">Loading…</p> : (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      {["Name", "Email", "Role", "City", "Joined", "Active"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-stone-900">{u.fullName}</td>
                        <td className="px-4 py-3 text-stone-500">{u.email}</td>
                        <td className="px-4 py-3 capitalize">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{u.role}</span>
                        </td>
                        <td className="px-4 py-3 text-stone-500">{u.city ?? "—"}</td>
                        <td className="px-4 py-3 text-stone-400 text-xs">{formatDate(u.createdAt as any)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(u.id, u.isActive)}
                            disabled={togglingId === u.id}
                            className="disabled:opacity-50"
                          >
                            {u.isActive
                              ? <ToggleRight className="w-6 h-6 text-green-500" />
                              : <ToggleLeft className="w-6 h-6 text-stone-300" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contractors */}
        {activeTab === "contractors" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-extrabold text-stone-900 text-lg flex-1">Contractors</h2>
              <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                {(["pending", "all"] as const).map((f) => (
                  <button key={f} onClick={() => setContractorFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${contractorFilter === f ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                    {f === "pending" ? "Pending Verification" : "All"}
                  </button>
                ))}
              </div>
            </div>
            {loading ? <p className="text-stone-400 text-sm">Loading…</p> : contractors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">
                {contractorFilter === "pending" ? "No pending verifications 🎉" : "No contractors found"}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      {["Business", "Owner", "Specialty", "City", "Rating", "Verified"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {contractors.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-semibold text-stone-900">{c.businessName}</td>
                        <td className="px-4 py-3 text-stone-500">{(c as any).user?.fullName ?? "—"}</td>
                        <td className="px-4 py-3 capitalize text-stone-500">{c.specialty}</td>
                        <td className="px-4 py-3 text-stone-500">{c.city ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-stone-700 font-semibold">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {Number(c.rating).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.isVerified ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4" /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => verifyContractor(c.id)}
                              disabled={togglingId === c.id}
                              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {togglingId === c.id ? "Verifying…" : "Verify"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Materials */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-stone-900 text-lg">Materials</h2>
            {loading ? <p className="text-stone-400 text-sm">Loading…</p> : (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      {["Name", "Category", "Supplier", "Price", "Stock", "Featured"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-semibold text-stone-900">{m.name}</td>
                        <td className="px-4 py-3 capitalize text-stone-500">{m.category}</td>
                        <td className="px-4 py-3 text-stone-500">{(m as any).supplier?.fullName ?? "—"}</td>
                        <td className="px-4 py-3 font-semibold">₹{Number(m.pricePerUnit).toLocaleString("en-IN")}/{m.unit}</td>
                        <td className="px-4 py-3 text-stone-500">{m.stockQuantity ?? "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleFeatured(m.id)}
                            disabled={togglingId === m.id}
                            className="disabled:opacity-50"
                          >
                            {m.isFeatured
                              ? <ToggleRight className="w-6 h-6 text-orange-500" />
                              : <ToggleLeft className="w-6 h-6 text-stone-300" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-stone-900 text-lg">All Orders</h2>
            {loading ? <p className="text-stone-400 text-sm">Loading…</p> : (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      {["Order ID", "Buyer", "Type", "Amount", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {orders.map((o) => {
                      const sc = ORDER_STATUS[o.status] ?? { label: o.status, color: "bg-stone-100 text-stone-600" };
                      return (
                        <tr key={o.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 font-mono text-xs text-stone-700">#{o.id.slice(-8).toUpperCase()}</td>
                          <td className="px-4 py-3 text-stone-600">{(o as any).buyer?.fullName ?? "—"}</td>
                          <td className="px-4 py-3 capitalize text-stone-500">{o.type}</td>
                          <td className="px-4 py-3 font-semibold">₹{Number(o.amount).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                          </td>
                          <td className="px-4 py-3 text-stone-400 text-xs">{formatDate(o.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
