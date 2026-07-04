"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, ChevronRight, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

const TYPE_EMOJI: Record<string, string> = {
  enquiry_received: "💬",
  enquiry_replied: "💬",
  bid_received: "📋",
  bid_status_changed: "🏆",
  order_placed: "📦",
  order_status: "🔄",
  welcome: "👋",
};

const TYPE_LABEL: Record<string, string> = {
  enquiry_received: "Enquiry",
  enquiry_replied: "Enquiry",
  bid_received: "Bid",
  bid_status_changed: "Bid",
  order_placed: "Order",
  order_status: "Order",
  welcome: "Welcome",
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refresh: refreshCount } = useNotifications();
  const router = useRouter();

  const [items, setItems] = useState<NotifItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth/login?redirect=/notifications");
  }, [authLoading, isAuthenticated, router]);

  const fetchPage = useCallback(async (p: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/notifications?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setItems(json.data ?? []);
        setTotal(json.total ?? 0);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPage(page); }, [fetchPage, page]);

  async function markRead(id: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
    if (!token) return;
    await fetch(`${BASE}/notifications/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    refreshCount();
  }

  async function markAllRead() {
    const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
    if (!token) return;
    await fetch(`${BASE}/notifications/read-all`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    refreshCount();
  }

  function handleClick(n: NotifItem) {
    if (!n.isRead) markRead(n.id);
    if (n.link) router.push(n.link);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-stone-400 mb-1">
            <Link href="/dashboard" className="hover:text-orange-500">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-700 font-medium">Notifications</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-stone-900">Notifications</h1>
              {unread > 0 && (
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">{unread} unread</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4 border-b border-stone-50 animate-pulse">
                <div className="w-10 h-10 bg-stone-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-stone-100 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                  <div className="h-2.5 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <Bell className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-500 font-semibold text-lg">All caught up!</p>
            <p className="text-stone-400 text-sm mt-1">You have no notifications yet. Start by exploring the marketplace.</p>
            <div className="flex justify-center gap-3 mt-6">
              <Link href="/contractors" className="btn-primary text-sm">Browse Contractors</Link>
              <Link href="/projects" className="btn-secondary text-sm">Open Projects</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {items.map((n, idx) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex gap-4 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors ${idx < items.length - 1 ? "border-b border-stone-50" : ""} ${!n.isRead ? "bg-orange-50/50" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${!n.isRead ? "bg-orange-100" : "bg-stone-100"}`}>
                  {TYPE_EMOJI[n.type] ?? "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {TYPE_LABEL[n.type] && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-0.5 block">{TYPE_LABEL[n.type]}</span>
                      )}
                      <p className={`text-sm leading-snug ${!n.isRead ? "font-bold text-stone-900" : "font-medium text-stone-800"}`}>{n.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{relativeTime(n.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">{n.body}</p>
                  {n.link && (
                    <span className="text-xs text-orange-500 font-semibold mt-1.5 flex items-center gap-1">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40 text-sm">Prev</button>
            <span className="text-sm text-stone-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-40 text-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
